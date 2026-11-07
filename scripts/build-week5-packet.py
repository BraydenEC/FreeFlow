#!/usr/bin/env python3
"""
Builds the Week 5 submission packet from docs/week5/WEEK5_SUBMISSION_DOCUMENT.md.

    python3 scripts/build-week5-packet.py                 # HTML + PDF, no passwords
    python3 scripts/build-week5-packet.py --with-logins   # also puts the grader logins in the PDF

The HTML is committed to this public repository, so it never contains passwords.
--with-logins copies them from the git-ignored demo-accounts.local.md into the PDF
and its local editable HTML only. Anything still written as [[like this]] is listed
when the build finishes, so an unfinished slot can't be missed.
"""

import argparse
import base64
import html
import mimetypes
import re
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WEEK = ROOT / "docs" / "week5"
SOURCE = WEEK / "WEEK5_SUBMISSION_DOCUMENT.md"
OUTPUT_HTML = WEEK / "WEEK5_SUBMISSION_DOCUMENT.html"
LOGINS = ROOT / "demo-accounts.local.md"
COURSE_FOLDER = Path.home() / "Documents/Documents/School Work /Negocios Inteligentes/Module 5"
LOGINS_BLOCK = re.compile(r"<!-- logins:start -->.*?<!-- logins:end -->", re.S)
MAX_IMAGE_BYTES = 900_000
NARROW_COLUMNS = {"#": 9, "Date": 9, "Commit": 14, "Tester": 9}

# Matches the look of the Week 1-4 PDFs as submitted (exported from Google Docs).
CSS = """
:root{color-scheme:light}
body{font-family:'Times New Roman',Times,serif;font-size:10.5pt;line-height:1.55;color:#111;background:#fff;max-width:6.5in;margin:0 auto}
h1{font-size:15pt;font-weight:bold;margin:20pt 0 14pt;padding-bottom:12pt;border-bottom:1px solid #bbb}
h2{font-size:12pt;font-weight:bold;margin:18pt 0 8pt}
h1,h2{break-after:avoid;page-break-after:avoid}
p{margin:7pt 0}
table{border-collapse:collapse;table-layout:fixed;width:88%;font-size:8.5pt;line-height:1.5;margin:10pt 0}
thead{display:table-header-group}
tr{break-inside:avoid;page-break-inside:avoid}
th{background:#eee;text-align:left;font-weight:normal}
td,th{border:1px solid #aaa;padding:6px 7px;overflow-wrap:break-word;vertical-align:top}
code{font-family:inherit}
pre{background:#f7f7f7;padding:8px;font-size:8pt;line-height:1.35;white-space:pre-wrap;break-inside:avoid;page-break-inside:avoid}
pre code{font-family:'Courier New',monospace}
blockquote{margin-left:12px;font-style:italic}
hr{border:none;border-top:1px solid #bbb;margin:16pt 0}
img{max-width:100%;height:auto}
.shot{break-inside:avoid;page-break-inside:avoid}
.shot img{max-height:480px;width:auto}
mark{background:none;color:inherit;font-weight:bold}
"""


def inline(text: str) -> str:
    """Bold, italics, code, links and slots, leaving code spans untouched."""
    spans: list[str] = []

    def keep(markup: str) -> str:
        spans.append(markup)
        return f"\x00{len(spans) - 1}\x00"

    text = re.sub(r"`([^`]+)`", lambda m: keep(f"<code>{html.escape(m.group(1), quote=False)}</code>"), text)
    text = html.escape(text, quote=False)
    text = re.sub(r"\[\[(.+?)\]\]", lambda m: keep(f"<mark>{m.group(1)}</mark>"), text)
    text = re.sub(r"\[([^\]]+)\]\((https?://[^)\s]+)\)", lambda m: keep(f'<a href="{m.group(2)}">{m.group(1)}</a>'), text)
    text = re.sub(r"(?<![\"'>])(https?://[^\s<|)]+)", lambda m: keep(f'<a href="{m.group(1)}">{m.group(1)}</a>'), text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"<em>\1</em>", text)
    return re.sub(r"\x00(\d+)\x00", lambda m: spans[int(m.group(1))], text)


def image(alt: str, path: str, tmp: Path) -> str:
    source = WEEK / path
    if source.stat().st_size > MAX_IMAGE_BYTES:
        small = tmp / (source.stem + ".jpg")
        subprocess.run(
            ["sips", "-Z", "1500", "-s", "format", "jpeg", "-s", "formatOptions", "75", str(source), "--out", str(small)],
            check=True,
            capture_output=True,
        )
        source = small
    mime = mimetypes.guess_type(source.name)[0]
    data = base64.b64encode(source.read_bytes()).decode()
    return f'<img alt="{html.escape(alt)}" src="data:{mime};base64,{data}">'


def table_row(line: str) -> list[str]:
    return [cell.strip() for cell in line.strip().strip("|").split("|")]


def columns(head: list[str]) -> str:
    """Equal columns like the earlier PDFs, except short ones such as # and Date."""
    fixed = [NARROW_COLUMNS[h] for h in head if h in NARROW_COLUMNS]
    share = (100 - sum(fixed)) / max(len(head) - len(fixed), 1)
    widths = [NARROW_COLUMNS.get(h, share) for h in head]
    return "<colgroup>" + "".join(f'<col style="width:{w:.1f}%">' for w in widths) + "</colgroup>"


def render(markdown: str, tmp: Path) -> str:
    out: list[str] = []
    lines = markdown.split("\n")
    i = 0
    while i < len(lines):
        line = lines[i]
        if not line.strip() or line.startswith("<!--"):
            i += 1
        elif line.startswith("```"):
            block = []
            i += 1
            while not lines[i].startswith("```"):
                block.append(lines[i])
                i += 1
            i += 1
            out.append(f"<pre><code>{html.escape(chr(10).join(block), quote=False)}</code></pre>")
        elif m := re.match(r"(#{1,3}) (.+)", line):
            level = len(m.group(1))
            out.append(f"<h{level}>{inline(m.group(2))}</h{level}>")
            i += 1
        elif re.fullmatch(r"-{3,}", line.strip()):
            out.append("<hr>")
            i += 1
        elif m := re.fullmatch(r"!\[(.*?)\]\((.+?)\)", line.strip()):
            out.append(f"<p>{image(m.group(1), m.group(2), tmp)}</p>")
            i += 1
        elif line.startswith("|"):
            head = table_row(line)
            i += 2
            body = []
            while i < len(lines) and lines[i].startswith("|"):
                body.append(table_row(lines[i]))
                i += 1
            head_html = "".join(f"<th>{inline(c)}</th>" for c in head)
            body_html = "".join("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in row) + "</tr>" for row in body)
            out.append(f'<table border="1" cellspacing="0" cellpadding="6">{columns(head)}<thead><tr>{head_html}</tr></thead><tbody>{body_html}</tbody></table>')
        elif line.startswith(">"):
            block = []
            while i < len(lines) and lines[i].startswith(">"):
                block.append(lines[i].lstrip("> "))
                i += 1
            out.append(f"<blockquote><p>{inline(' '.join(block))}</p></blockquote>")
        elif re.match(r"(- |\d+\. )", line):
            tag = "ul" if line.startswith("- ") else "ol"
            items: list[str] = []
            while i < len(lines) and (re.match(r"(- |\d+\. )", lines[i]) or lines[i].startswith("  ")):
                if lines[i].startswith("  "):
                    items[-1] += " " + lines[i].strip()
                else:
                    items.append(re.sub(r"^(- |\d+\. )", "", lines[i]))
                i += 1
            out.append(f"<{tag}>" + "".join(f"<li>{inline(x)}</li>" for x in items) + f"</{tag}>")
        else:
            block = []
            while i < len(lines) and lines[i].strip() and not re.match(r"(#{1,3} |\||>|!\[|```|- |\d+\. |-{3,}$)", lines[i]):
                block.append(lines[i].strip())
                i += 1
            out.append(f"<p>{inline(' '.join(block))}</p>")
    body = "\n".join(out)
    # Keep each screenshot on the same page as its caption.
    body = re.sub(r"(<p><strong>[^\n]*</p>)\s*((?:<p><img [^\n]*></p>\s*)+)", r'<div class="shot">\1\n\2</div>\n', body)
    return re.sub(r'(<h[23]>[^\n]*</h[23]>)\s*<div class="shot">', r'<div class="shot">\1\n', body)


def page(body: str) -> str:
    return (
        "<!doctype html><html><head><meta charset='utf-8'>"
        "<meta name='viewport' content='width=device-width, initial-scale=1'>"
        f"<title>Week 5 Submission — FreeFlow</title><style>{CSS}</style></head><body>{body}</body></html>"
    )


def login_table() -> str:
    """The most recent password for each grader, from the git-ignored file."""
    latest: dict[str, str] = {}
    for email, password in re.findall(r"^\| (grader\d@freeflow\.website) \| (\S+) \|$", LOGINS.read_text(), re.M):
        latest[email] = password
    if not latest:
        raise SystemExit(f"No logins found in {LOGINS.name}. Run: npm run demo:accounts -- --reset")
    rows = "\n".join(f"| {email} | `{password}` |" for email, password in sorted(latest.items()))
    return f"| Email | Password |\n|---|---|\n{rows}"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--with-logins", action="store_true", help="put the grader logins in the PDF only")
    parser.add_argument("--out", type=Path, default=COURSE_FOLDER / "FreeFlow-Week5-Submission.pdf")
    args = parser.parse_args()

    markdown = SOURCE.read_text(encoding="utf8")
    with tempfile.TemporaryDirectory() as folder:
        tmp = Path(folder)
        public = page(render(markdown, tmp))
        OUTPUT_HTML.write_text(public, encoding="utf8")

        printable = public
        if args.with_logins:
            printable = page(render(LOGINS_BLOCK.sub(lambda _: login_table(), markdown), tmp))
        print_html = tmp / "print.html"
        print_html.write_text(printable, encoding="utf8")
        args.out.parent.mkdir(parents=True, exist_ok=True)
        editable = args.out.with_name(f"{args.out.stem} (editable).html")
        editable.write_text(printable, encoding="utf8")

        tool = tmp / "html2pdf"
        subprocess.run(["swiftc", "-O", str(ROOT / "scripts" / "html2pdf.swift"), "-o", str(tool)], check=True)
        subprocess.run([str(tool), str(print_html), str(args.out)], check=True, timeout=180)

        slots = re.findall(r"<mark>(.*?)</mark>", printable)

    print(f"HTML: {OUTPUT_HTML.relative_to(ROOT)}")
    print(f"PDF:  {args.out}")
    print(f"Editable HTML: {editable}")
    if slots:
        print(f"\nNOT READY TO SUBMIT: {len(slots)} slot(s) still open:")
        for slot in slots:
            print(f"  - {slot}")
    else:
        print("\nNo open slots.")


if __name__ == "__main__":
    main()
