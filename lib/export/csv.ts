import { projectValue } from "@/lib/format";
import { computeWithholding } from "@/lib/tax/withholding";
import type { Project } from "@/types/project";

/*
  CSV export.

  The point of this file is the contador. At the end of a period a freelancer
  has to hand someone a list of what was billed, what was withheld and what
  arrived, and until now the only way to get that out of FreeFlow was to read
  it off the screen. A tracker you cannot export from is a tracker you cannot
  leave, and that is a worse reason to keep users than the product being good.

  TWO THINGS THAT MAKE CSV HARDER THAN IT LOOKS

  1. Formula injection. A spreadsheet treats a cell beginning with =, +, - or
     @ as a formula, so a project literally named "=cmd|' /c calc'!A0" becomes
     executable the moment somebody opens the file in Excel. The field is
     user-controlled — anyone can name a project anything — so every value is
     checked and dangerous leading characters are neutralised with a leading
     apostrophe, which spreadsheets strip on display.

  2. Accents. Without a UTF-8 byte order mark, Excel on Windows reads the file
     as Latin-1 and every "Martínez" becomes "MartÃ­nez". The BOM is three
     bytes and it is the difference between a usable file and a support
     request.

  Numbers are written unformatted — no currency symbol, no thousands
  separator — because the destination is a spreadsheet that wants to do
  arithmetic on them, not a human reading them in a terminal.
*/

/** Excel and Numbers both need this to read the file as UTF-8. */
export const UTF8_BOM = "﻿";

/** Characters that turn a cell into a formula. */
const FORMULA_STARTERS = ["=", "+", "-", "@", "\t", "\r"];

/**
 * One CSV cell, escaped and made inert.
 *
 * Order matters: neutralise the formula first, then quote. Quoting first
 * would put the apostrophe inside the quotes in the wrong position.
 */
export function csvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";

  let s = String(value);

  if (FORMULA_STARTERS.some((c) => s.startsWith(c))) {
    s = `'${s}`;
  }

  if (s.includes('"') || s.includes(",") || s.includes("\n") || s.includes("\r")) {
    s = `"${s.replace(/"/g, '""')}"`;
  }

  return s;
}

export function toCsv(headers: string[], rows: (string | number | null)[][]): string {
  const lines = [
    headers.map(csvCell).join(","),
    ...rows.map((r) => r.map(csvCell).join(",")),
  ];
  // CRLF because that is what spreadsheet software emits and expects.
  return UTF8_BOM + lines.join("\r\n") + "\r\n";
}

const CLIENT_TYPE_LABEL: Record<string, string> = {
  persona_fisica: "Persona física",
  persona_moral: "Persona moral",
};

const STATUS_LABEL: Record<string, string> = {
  contracted: "Contract signed",
  in_progress: "In progress",
  awaiting_review: "Awaiting review",
  invoice_sent: "Invoice sent",
  overdue: "Overdue",
};

export const PROJECT_CSV_HEADERS = [
  "Project",
  "Client",
  "Client tax type",
  "Status",
  "Paid",
  "Deadline",
  "Paid on",
  "Contract signed",
  "Billing",
  "Hours logged",
  "Hourly rate",
  "Subtotal",
  "IVA",
  "Invoiced",
  "IVA retenido",
  "ISR retenido",
  "Withheld total",
  "Net received",
  "Contract link",
  "Payment link",
];

/**
 * Every project as a row, with the withholding already worked out.
 *
 * The three columns a contador actually needs — withheld, net, and the two
 * retenciones separately — are computed here rather than left as a formula
 * for somebody else to get wrong.
 */
export function projectsToCsv(projects: Project[]): string {
  const rows = projects.map((p) => {
    const subtotal = projectValue(p);
    const w = computeWithholding(subtotal, p.clientTaxType);

    return [
      p.name,
      p.client,
      p.clientTaxType ? (CLIENT_TYPE_LABEL[p.clientTaxType] ?? p.clientTaxType) : "",
      STATUS_LABEL[p.status] ?? p.status,
      p.isPaid ? "Yes" : "No",
      p.deadline,
      p.paidAt ?? "",
      p.contractSignedOn ?? "",
      p.invoiceTotal === null ? "Hourly" : "Fixed",
      p.invoiceTotal === null ? p.hoursLogged : "",
      p.invoiceTotal === null ? p.hourlyRate : "",
      w.subtotal,
      w.iva,
      w.invoiced,
      w.ivaRetenido,
      w.isrRetenido,
      w.withheldTotal,
      w.net,
      p.contractUrl ?? "",
      p.paymentUrl ?? "",
    ];
  });

  return toCsv(PROJECT_CSV_HEADERS, rows);
}

/** A filename that sorts chronologically and says what it is. */
export function csvFilename(now: Date): string {
  return `freeflow-projects-${now.toISOString().slice(0, 10)}.csv`;
}
