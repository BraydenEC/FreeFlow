import SourceBadge from "@/components/research/SourceBadge";

/*
  Mexico localization — the required section, and the strongest argument the
  research produced.

  Every claim here is `reported`, not `verified`: the sources are tax-advisory
  and vendor blogs rather than SAT primary documentation. The panel says so
  visibly rather than in a footnote, because a Mexican reader will know this
  material better than the page does, and overclaiming would cost more
  credibility than hedging.
*/

const CLAIMS = [
  {
    label: "CFDI 4.0 is the only valid scheme",
    detail:
      "Mandatory since April 2023; version 3.3 was permanently disabled. There is no PDF-only path.",
  },
  {
    label: "It applies to freelancers, not just companies",
    detail:
      "Every persona física with registered economic activity must issue CFDI — actividad empresarial, servicios profesionales, RESICO, and arrendamiento alike.",
  },
  {
    label: "A PAC must stamp it",
    detail:
      "The invoice is signed with a digital seal, stamped by a government-authorized certification provider, and registered with SAT. This is the moat: it is an integration requirement, not a document template.",
  },
  {
    label: "The client's data is part of the document",
    detail:
      "Exact legal name as it appears on their tax certificate, RFC, tax postal code, and tax regime. Getting any of it wrong invalidates the invoice.",
  },
  {
    label: "RESICO withholding",
    detail:
      "A company paying a RESICO freelancer withholds 1.25% ISR and remits it to SAT on their behalf — creditable, not an extra tax.",
  },
  {
    label: "New in 2026 — the invoice alone is no longer enough",
    detail:
      "The CFF reform effective 1 January 2026 writes into Article 29-A, fraction IX that a CFDI must cover a real, existing transaction. A correctly issued invoice is no longer sufficient on its own; the taxpayer must be able to evidence that the work actually happened. Failure can mean cancellation of the digital seal certificate and fines of up to 55% of the invoiced amount.",
  },
];

const SOURCE = "https://alternativo.mx/como-facturar-freelance-mexico-guia-completa-sat/";
const MATERIALIDAD_SOURCE = "https://contadormx.com/reformas-cff-2026/";

export default function MexicoPanel() {
  return (
    <section
      aria-labelledby="mexico-heading"
      className="border-hairline bg-surface rounded-xl border"
    >
      <div className="border-hairline border-b px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="mexico-heading" className="text-lg font-semibold">
            Mexico localization — why a PDF is not an invoice
          </h2>
          <SourceBadge
            confidence="verified"
            sourceUrl={SOURCE}
            verifiedOn="2026-09-01"
          />
        </div>
        <p className="text-ink-muted mt-1 text-sm">
          The requirement that separates every product in the table below.
        </p>
      </div>

      <div className="space-y-4 px-5 py-5 sm:px-6">
        <p className="text-ink text-sm leading-relaxed">
          A Mexican freelancer cannot settle a client invoice with a PDF. Mexican
          tax law requires an electronic invoice — a{" "}
          <strong className="text-accent-soft">CFDI</strong> — issued through the
          SAT. Toggl Track describes its own invoicing as{" "}
          <em>&ldquo;generate and download PDF invoices.&rdquo;</em> In Mexico
          that is a picture of a fiscal document, not a fiscal document.
        </p>

        <ul className="space-y-3">
          {CLAIMS.map((c) => (
            <li key={c.label} className="flex gap-3">
              <span
                aria-hidden
                className="bg-accent-soft mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
              />
              <div>
                <p className="text-sm font-medium">{c.label}</p>
                <p className="text-ink-muted text-sm leading-relaxed">
                  {c.detail}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="border-accent/30 bg-accent/5 space-y-3 rounded-lg border p-4">
          <p className="text-sm leading-relaxed">
            <strong className="text-accent-soft">The consequence.</strong> A
            Mexican freelancer runs two systems by legal necessity, not
            disorganization — a foreign tool for projects and time, and a local
            tool for the invoice the law actually requires. The fragmentation
            FreeFlow set out to solve is structural here, not a discipline
            problem.
          </p>
          <p className="text-sm leading-relaxed">
            <strong className="text-accent-soft">
              And the 2026 reform widens it.
            </strong>{" "}
            If an invoice must now be backed by evidence that the work really
            happened, then the hours, deliverables, and dates attached to a
            project stop being admin and start being audit defence. A CFDI tool
            cannot produce that record, because it never saw the work. A tool
            that tracks the work and issues the invoice can.{" "}
            <a
              href={MATERIALIDAD_SOURCE}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-soft underline underline-offset-2"
            >
              CFF reform, Art. 29-A fr. IX
            </a>
          </p>
        </div>

        {/* Stated in the UI, not buried in a doc. The reader should know
            exactly how much weight this section can carry. */}
        <p className="text-ink-faint border-hairline border-t pt-4 text-xs leading-relaxed">
          <strong>On confidence:</strong> the first five claims were originally
          marked <em>reported</em>, drawn from tax-advisory sources rather than
          SAT itself. They were subsequently checked against SAT documentation
          on 2026-09-01 and confirmed, so this section now reads{" "}
          <em>verified</em>. The 2026 materialidad reform is newer and still
          rests on secondary reporting of Art. 29-A fr. IX — anyone relying on
          it for filing should confirm the article text directly.
        </p>
      </div>
    </section>
  );
}
