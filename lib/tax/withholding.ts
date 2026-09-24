/*
  Mexican withholding — retenciones.

  THE PROBLEM THIS SOLVES
  A persona física invoices a persona moral for 10,000 MXN of professional
  services. The invoice totals 11,600 with IVA. What arrives in the bank is
  9,533.33, because the payer is legally required to withhold part of the IVA
  and part of the ISR and remit it to the SAT directly.

  So "I invoiced 10,000" and "I received 9,533" are both true, and a tracker
  that only knows the first number tells its user the wrong thing about their
  own money. Every dashboard figure in this product was derived from invoice
  totals; this is what makes a net figure possible.

  WHO IT APPLIES TO
  Only when a persona física bills a persona moral. Persona física to persona
  física carries no withholding, and that is why the payer's tax type has to
  be recorded per project rather than assumed.

  THE RATES, AND WHERE THEY COME FROM
    IVA               16%        LIVA art. 1
    IVA retenido      two-thirds of the IVA (10.6667% of subtotal)
                                 LIVA art. 1-A fracc. II inciso a
    ISR retenido      depends on the RECIPIENT'S regime:
                        régimen general  10%     LISR art. 106, último párrafo
                        RESICO           1.25%   LISR art. 113-J

  WHY THE REGIME MATTERS MORE THAN IT LOOKS

  RESICO has been the default simplified regime for personas físicas since
  2022 and a large share of freelancers are on it. The gap between 10% and
  1.25% is 8.75% of every subtotal: on a 100,000 year, roughly 8,750 that the
  product would otherwise claim is withheld when it is not.

  Withholding depends on both parties. The PAYER decides whether anything is
  withheld at all — only a persona moral withholds — and that is recorded per
  project, because it changes per client. The RECIPIENT'S regime decides the
  ISR rate, and that is a property of the freelancer rather than of any one
  job, so it lives on the account.

  An unset regime is treated as régimen general. That is the conservative
  direction: it overstates withholding rather than understating it, and money
  that arrives unexpectedly is a better failure than money that does not.
  The UI says which regime it assumed rather than leaving it implicit.

  Still not modelled: border-zone IVA, exempt and zero-rated activities. The
  UI says so rather than implying this is tax advice.

  ROUNDING
  Every component rounds to centavos independently, then the net is the
  subtraction of rounded parts. That is what a CFDI does — the document
  carries each rounded figure — so computing a net from unrounded
  intermediates would produce a number that disagrees with the invoice by a
  centavo or two. Matching the document matters more than matching the
  abstract arithmetic.
*/

export const IVA_RATE = 0.16;
/** Two-thirds of the IVA rate. Expressed against the subtotal. */
export const IVA_RETENIDO_RATE = (2 / 3) * IVA_RATE;

/** The recipient's tax regime. Decides the ISR withholding rate. */
export type TaxRegime = "general" | "resico";

export const TAX_REGIMES: TaxRegime[] = ["general", "resico"];

export const DEFAULT_TAX_REGIME: TaxRegime = "general";

export const ISR_RETENIDO_RATES: Record<TaxRegime, number> = {
  general: 0.1,
  resico: 0.0125,
};

/** Kept for the régimen general, which is what it always meant. */
export const ISR_RETENIDO_RATE = ISR_RETENIDO_RATES.general;

export const TAX_REGIME_LABELS: Record<TaxRegime, string> = {
  general: "Régimen general (actividad empresarial y profesional)",
  resico: "RESICO (Régimen Simplificado de Confianza)",
};

export const WITHHOLDING_SOURCES = [
  { label: "IVA 16%", cite: "LIVA art. 1" },
  { label: "IVA retenido, dos terceras partes", cite: "LIVA art. 1-A fracc. II inciso a" },
  { label: "ISR retenido, régimen general 10%", cite: "LISR art. 106, último párrafo" },
  { label: "ISR retenido, RESICO 1.25%", cite: "LISR art. 113-J" },
] as const;

/** Who is paying. Withholding only applies when a company pays an individual. */
export type ClientTaxType = "persona_fisica" | "persona_moral";

export const CLIENT_TAX_TYPES: ClientTaxType[] = ["persona_fisica", "persona_moral"];

export type Withholding = {
  /** The amount billed before tax. */
  subtotal: number;
  /** IVA charged on top. */
  iva: number;
  /** What the invoice says in total. */
  invoiced: number;
  /** IVA withheld by the payer. */
  ivaRetenido: number;
  /** ISR withheld by the payer. */
  isrRetenido: number;
  /** Everything withheld. */
  withheldTotal: number;
  /** What actually arrives. */
  net: number;
  /** False when no withholding applies, in which case net === invoiced. */
  applies: boolean;
  /** Which regime's ISR rate was used. Shown rather than assumed silently. */
  regime: TaxRegime;
};

/** Round to centavos. Half-up, which is what invoicing software does. */
function centavos(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Break a subtotal into what is invoiced and what is actually received.
 *
 * A negative or non-finite subtotal is treated as zero rather than throwing.
 * This runs on user-entered project values, and a dashboard that crashes on
 * a bad row is worse than one that shows a zero.
 */
export function computeWithholding(
  subtotal: number,
  clientTaxType: ClientTaxType | null,
  regime: TaxRegime = DEFAULT_TAX_REGIME,
): Withholding {
  const base = Number.isFinite(subtotal) && subtotal > 0 ? centavos(subtotal) : 0;
  const iva = centavos(base * IVA_RATE);
  const invoiced = centavos(base + iva);

  // Unknown tax type is treated as no withholding. Inventing a deduction
  // against a client whose type was never recorded would understate earnings,
  // and quietly telling someone they earned less is its own kind of wrong.
  const applies = clientTaxType === "persona_moral";

  if (!applies) {
    return {
      subtotal: base,
      iva,
      invoiced,
      ivaRetenido: 0,
      isrRetenido: 0,
      withheldTotal: 0,
      net: invoiced,
      applies: false,
      regime,
    };
  }

  const isrRate = ISR_RETENIDO_RATES[regime] ?? ISR_RETENIDO_RATES[DEFAULT_TAX_REGIME];
  const ivaRetenido = centavos(base * IVA_RETENIDO_RATE);
  const isrRetenido = centavos(base * isrRate);
  const withheldTotal = centavos(ivaRetenido + isrRetenido);

  return {
    subtotal: base,
    iva,
    invoiced,
    ivaRetenido,
    isrRetenido,
    withheldTotal,
    net: centavos(invoiced - withheldTotal),
    applies: true,
    regime,
  };
}
