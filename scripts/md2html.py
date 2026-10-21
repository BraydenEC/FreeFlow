#!/usr/bin/env python3
"""
Markdown -> styled HTML for Google Docs import.

Kept in the repo rather than /tmp this time: it was written for the Week 1
export, lost when the temp directory cleared, and rebuilt for Week 2. A build
tool that has to be recreated each time it is needed is not a tool.

Google Docs imports HTML with tables and headings intact, which .docx via
macOS `textutil` does not — that route flattened every table when it was tried
for Week 1. Hence HTML.
"""
import re, sys, html, os, base64, mimetypes

# Images are embedded as data URIs, so the exported file carries them into a
# Google Docs import or a printed PDF instead of pointing at a local path.
SRC_DIR = os.path.dirname(os.path.abspath(sys.argv[1])) if len(sys.argv) > 1 else "."

def image(alt, src):
    path = os.path.join(SRC_DIR, src)
    if not os.path.exists(path):
        return f'<p><em>[missing image: {html.escape(src)}]</em></p>'
    mime = mimetypes.guess_type(path)[0] or "image/png"
    data = base64.b64encode(open(path, "rb").read()).decode()
    return f'<p><img src="data:{mime};base64,{data}" alt="{html.escape(alt)}" style="max-width:100%"/></p>'

def inline(t):
    t = html.escape(t)
    t = re.sub(r'`([^`]+)`', r'<code>\1</code>', t)
    t = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'(?<!\w)\*([^*\n]+)\*(?!\w)', r'<em>\1</em>', t)
    t = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', t)
    t = re.sub(r'&lt;(https?://[^&\s]+)&gt;', r'<a href="\1">\1</a>', t)
    return t

def convert(md):
    out, i, lines = [], 0, md.split('\n')
    while i < len(lines):
        L = lines[i]
        if L.startswith('```'):
            i += 1; buf = []
            while i < len(lines) and not lines[i].startswith('```'):
                buf.append(html.escape(lines[i])); i += 1
            i += 1
            out.append('<pre><code>' + '\n'.join(buf) + '</code></pre>'); continue
        if L.strip().startswith('|') and i+1 < len(lines) and re.match(r'^\s*\|[\s:|-]+\|\s*$', lines[i+1]):
            hdr = [c.strip() for c in L.strip().strip('|').split('|')]
            i += 2; rows = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                rows.append([c.strip() for c in lines[i].strip().strip('|').split('|')]); i += 1
            t = ['<table border="1" cellspacing="0" cellpadding="6"><thead><tr>']
            t += [f'<th>{inline(c)}</th>' for c in hdr]
            t.append('</tr></thead><tbody>')
            for r in rows:
                t.append('<tr>' + ''.join(f'<td>{inline(c)}</td>' for c in r) + '</tr>')
            t.append('</tbody></table>')
            out.append(''.join(t)); continue
        m = re.match(r'^!\[([^\]]*)\]\(([^)]+)\)\s*$', L)
        if m:
            out.append(image(m.group(1), m.group(2))); i += 1; continue
        m = re.match(r'^(#{1,6})\s+(.*)$', L)
        if m:
            lv = len(m.group(1)); out.append(f'<h{lv}>{inline(m.group(2))}</h{lv}>'); i += 1; continue
        if re.match(r'^---+\s*$', L):
            out.append('<hr/>'); i += 1; continue
        if L.startswith('>'):
            buf = []
            while i < len(lines) and lines[i].startswith('>'):
                buf.append(lines[i].lstrip('>').strip()); i += 1
            out.append('<blockquote><p>' + inline(' '.join(buf)) + '</p></blockquote>'); continue
        if re.match(r'^\s*[-*]\s+', L) or re.match(r'^\s*\d+\.\s+', L):
            ordered = bool(re.match(r'^\s*\d+\.\s+', L))
            tag = 'ol' if ordered else 'ul'
            items = []
            while i < len(lines) and (re.match(r'^\s*[-*]\s+', lines[i]) or re.match(r'^\s*\d+\.\s+', lines[i])):
                items.append(re.sub(r'^\s*(?:[-*]|\d+\.)\s+', '', lines[i])); i += 1
            out.append(f'<{tag}>' + ''.join(f'<li>{inline(x)}</li>' for x in items) + f'</{tag}>')
            continue
        if L.strip() == '':
            i += 1; continue
        buf = []
        while (i < len(lines) and lines[i].strip() != ''
               and not lines[i].startswith(('#', '>', '```', '|'))
               and not re.match(r'^---+\s*$', lines[i])
               and not re.match(r'^\s*[-*]\s+', lines[i])
               and not re.match(r'^\s*\d+\.\s+', lines[i])):
            buf.append(lines[i]); i += 1
        out.append('<p>' + inline(' '.join(buf)) + '</p>')
    return '\n'.join(out)

CSS = """body{font-family:Georgia,'Times New Roman',serif;font-size:11pt;line-height:1.5;color:#111;max-width:7.5in}
h1{font-size:20pt;border-bottom:2px solid #333;padding-bottom:6px;margin-top:24pt}
h2{font-size:15pt;margin-top:20pt;color:#1a1a1a}
h3{font-size:12.5pt;margin-top:14pt}
table{border-collapse:collapse;width:100%;font-size:9.5pt;margin:10pt 0}
th{background:#eee;text-align:left}
td,th{border:1px solid #999;padding:5px}
code{font-family:'Courier New',monospace;font-size:9.5pt;background:#f2f2f2}
pre{background:#f5f5f5;border:1px solid #ccc;padding:8px;font-size:9pt;white-space:pre-wrap}
blockquote{border-left:3px solid #888;margin-left:0;padding-left:12px;color:#333;font-style:italic}
hr{border:none;border-top:1px solid #bbb;margin:16pt 0}"""

src = open(sys.argv[1]).read()
title = sys.argv[3] if len(sys.argv) > 3 else "Submission"
open(sys.argv[2], 'w').write(
    f"<!DOCTYPE html><html><head><meta charset='utf-8'><title>{title}</title>"
    f"<style>{CSS}</style></head><body>{convert(src)}</body></html>")
print("html written")
