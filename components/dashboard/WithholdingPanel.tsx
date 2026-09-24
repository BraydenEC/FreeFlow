import { formatCurrency, projectValue } from "@/lib/format";
import {
  computeWithholding,
  TAX_REGIME_LABELS,
  type TaxRegime,
} from "@/lib/tax/withholding";
import type { CurrencyCode } from "@/lib/currency";
import type { Project } from "@/types/project";

/*
  What will actually arrive, across the work that has not been paid yet.

  Every other figure on this dashboard is what was invoiced. For a persona
  física billing a persona moral those are different numbers: the payer
  withholds two thirds of the IVA and 10% of the subtotal and remits both to
  the SAT, so an invoice for 10,000 lands as 9,533.33.

  Only unpaid projects are counted. Money already received needs no forecast,
  and the useful question is what is still coming.

  Renders null when no unpaid project has a persona moral client, which is
  also the state of every project whose client type was never recorded. A
  panel of zeroes explaining a tax that does not apply to you is clutter.
*/

export default function WithholdingPanel({
  projects,
  currency,
  regime,
}: {
  projects: Project[];
  currency: CurrencyCode;
  regime: TaxRegime;
}) {
  const affected = projects.filter(
    (p) => !p.isPaid && p.clientTaxType === "persona_moral",
  );

  if (affected.length === 0) return null;

  const totals = affected.reduce(
    (acc, p) => {
      const w = computeWithholding(projectValue(p), p.clientTaxType, regime);
      return {
        invoiced: acc.invoiced + w.invoiced,
        withheld: acc.withheld + w.withheldTotal,
        net: acc.net + w.net,
      };
    },
    { invoiced: 0, withheld: 0, net: 0 },
  );

  return (
    <section
      aria-labelledby="withholding-heading"
      className="border-hairline bg-surface rounded-lg border"
    >
      <div className="border-hairline flex items-center justify-between border-b px-5 py-3.5">
        <h2
          id="withholding-heading"
          className="text-[11px] font-medium tracking-[0.12em] uppercase"
        >
          After retenciones
        </h2>
        <span className="text-ink-faint text-xs">
          {affected.length} unpaid{" "}
          {affected.length === 1 ? "invoice" : "invoices"}
        </span>
      </div>

      <dl className="grid grid-cols-3 gap-px">
        <div className="px-5 py-4">
          <dt className="text-ink-faint text-[11px]">Invoiced</dt>
          <dd className="numeric text-ink mt-1 text-lg font-semibold">
            {formatCurrency(totals.invoiced, currency)}
          </dd>
        </div>
        <div className="px-5 py-4">
          <dt className="text-ink-faint text-[11px]">Withheld</dt>
          <dd className="numeric text-ink-muted mt-1 text-lg font-semibold">
            −{formatCurrency(totals.withheld, currency)}
          </dd>
        </div>
        <div className="px-5 py-4">
          <dt className="text-ink-faint text-[11px]">You receive</dt>
          <dd className="numeric text-ink mt-1 text-lg font-semibold">
            {formatCurrency(totals.net, currency)}
          </dd>
        </div>
      </dl>

      <div className="border-hairline border-t px-5 py-3">
        <p className="text-ink-faint text-[11px]">
          IVA retenido two-thirds · ISR retenido{" "}
          {regime === "resico" ? "1.25%" : "10%"} · {TAX_REGIME_LABELS[regime]}
        </p>
        <p className="text-ink-faint mt-1 text-[11px]">
          General case for servicios profesionales. Border-zone IVA, RESICO and
          exempt activities are not modelled. Not tax advice.
        </p>
      </div>
    </section>
  );
}
