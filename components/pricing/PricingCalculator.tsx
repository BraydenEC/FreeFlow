"use client";

import { useMemo, useState } from "react";
import { computePricing } from "@/lib/pricing/model";
import { SCENARIOS, SCENARIO_ORDER } from "@/lib/pricing/scenarios";
import { toMxn, USD_TO_MXN, FX_DATE } from "@/lib/pricing/tiers";
import type { PricingInputs, ScenarioId } from "@/types/pricing";

/*
  The revenue simulator.

  A Client Component because dragging an input and waiting for a server round
  trip is not a simulator. All arithmetic lives in lib/pricing/model.ts, which
  is pure and separately tested — this file only renders it.

  The scenario toggle replaces every input at once rather than scaling a single
  number, so "conservative" means a different world rather than a smaller
  version of the same one.
*/

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const mxn = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

type FieldProps = {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  percent?: boolean;
  onChange: (v: number) => void;
};

function Field({
  label,
  hint,
  value,
  min,
  max,
  step,
  suffix,
  percent,
  onChange,
}: FieldProps) {
  const display = percent ? Math.round(value * 100) : value;
  const id = label.toLowerCase().replace(/[^a-z]+/g, "-");

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <span className="numeric text-accent-soft text-sm">
          {display}
          {percent ? "%" : suffix ? ` ${suffix}` : ""}
        </span>
      </div>
      {hint && <p className="text-ink-faint mt-0.5 text-xs">{hint}</p>}
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-accent mt-2 w-full"
      />
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  emphasis,
}: {
  label: string;
  value: string;
  sub?: string;
  emphasis?: boolean;
}) {
  return (
    <div className="border-hairline bg-raised/30 rounded-lg border p-4">
      <p className="text-ink-muted text-xs font-medium tracking-wide uppercase">
        {label}
      </p>
      <p
        className={`numeric mt-1.5 text-2xl font-semibold tracking-tight ${emphasis ? "text-accent-soft" : ""}`}
      >
        {value}
      </p>
      {sub && <p className="text-ink-faint mt-0.5 text-xs">{sub}</p>}
    </div>
  );
}

export default function PricingCalculator() {
  const [scenario, setScenario] = useState<ScenarioId>("base");
  const [inputs, setInputs] = useState<PricingInputs>(SCENARIOS.base.inputs);
  const [dirty, setDirty] = useState(false);
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const result = useMemo(() => computePricing(inputs), [inputs]);

  function pickScenario(id: ScenarioId) {
    setScenario(id);
    setInputs(SCENARIOS[id].inputs);
    setDirty(false);
    setSaveState("idle");
  }

  function set<K extends keyof PricingInputs>(key: K, value: PricingInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
    setSaveState("idle");
  }

  async function save() {
    setSaveState("saving");
    setSaveError(null);
    try {
      const res = await fetch("/api/pricing/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${SCENARIOS[scenario].name}${dirty ? " (adjusted)" : ""}`,
          scenario,
          inputs,
          mrr: result.mrr,
          arr: result.arr,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.issues?.join(" ") ?? data.error ?? "Save failed.");
        setSaveState("error");
        return;
      }
      setSaveState("saved");
    } catch {
      setSaveError("Could not reach the server.");
      setSaveState("error");
    }
  }

  const maxProjectionMrr = Math.max(...result.projection.map((p) => p.mrr), 1);
  const declining =
    result.projection[11].mrr < result.projection[0].mrr;

  return (
    <section aria-labelledby="calculator-heading" className="space-y-4">
      <div>
        <h2 id="calculator-heading" className="text-lg font-semibold">
          Revenue simulator
        </h2>
        <p className="text-ink-muted mt-1 text-sm">
          Every number below is computed from the inputs. Change one and watch
          what happens — including the parts that are uncomfortable.
        </p>
      </div>

      {/* Scenario toggle */}
      <div
        role="radiogroup"
        aria-label="Scenario"
        className="border-hairline bg-surface flex flex-wrap gap-2 rounded-xl border p-2"
      >
        {SCENARIO_ORDER.map((id) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={scenario === id}
            onClick={() => pickScenario(id)}
            className={`focus-visible:ring-accent flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none ${
              scenario === id
                ? "bg-accent/15 text-accent-soft"
                : "text-ink-muted hover:bg-raised/50 hover:text-ink"
            }`}
          >
            {SCENARIOS[id].name}
          </button>
        ))}
      </div>

      <p className="text-ink-muted border-hairline bg-surface rounded-xl border px-5 py-4 text-sm leading-relaxed">
        {SCENARIOS[scenario].summary}
        {dirty && (
          <span className="text-ink-faint"> — inputs adjusted from the preset.</span>
        )}
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Inputs */}
        <div className="border-hairline bg-surface space-y-5 rounded-xl border p-5 sm:p-6">
          <h3 className="text-[15px] font-semibold">Inputs</h3>

          <Field
            label="Freelancer accounts"
            hint="Segment A — hourly or retainer, in Mexico"
            value={inputs.freelancers}
            min={0}
            max={2000}
            step={10}
            onChange={(v) => set("freelancers", v)}
          />
          <Field
            label="On the paid Pro tier"
            hint="The rest stay on free Solo and contribute nothing"
            value={inputs.freelancerPaidShare}
            min={0}
            max={1}
            step={0.01}
            percent
            onChange={(v) => set("freelancerPaidShare", v)}
          />
          <Field
            label="Studio accounts"
            hint="Segment B — 2 to 5 people under one name"
            value={inputs.studios}
            min={0}
            max={300}
            step={1}
            onChange={(v) => set("studios", v)}
          />
          <Field
            label="Seats per studio"
            value={inputs.seatsPerStudio}
            min={2}
            max={5}
            step={1}
            suffix="seats"
            onChange={(v) => set("seatsPerStudio", v)}
          />
          <Field
            label="Monthly churn"
            hint="Compounds. The largest lever in this model."
            value={inputs.monthlyChurn}
            min={0}
            max={0.3}
            step={0.01}
            percent
            onChange={(v) => set("monthlyChurn", v)}
          />
          <Field
            label="Monthly growth"
            value={inputs.monthlyGrowth}
            min={0}
            max={0.3}
            step={0.01}
            percent
            onChange={(v) => set("monthlyGrowth", v)}
          />
          <Field
            label="Paying annually"
            hint="Annual billing is discounted, so this lowers MRR"
            value={inputs.annualShare}
            min={0}
            max={1}
            step={0.05}
            percent
            onChange={(v) => set("annualShare", v)}
          />
          <Field
            label="Annual discount"
            value={inputs.annualDiscount}
            min={0}
            max={0.4}
            step={0.05}
            percent
            onChange={(v) => set("annualDiscount", v)}
          />
        </div>

        {/* Outputs */}
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Stat
              label="MRR"
              value={usd.format(result.mrr)}
              sub={`${mxn.format(toMxn(result.mrr))} MXN`}
              emphasis
            />
            <Stat
              label="ARR"
              value={usd.format(result.arr)}
              sub="run-rate, not the sum of the projection"
            />
            <Stat
              label="Blended ARPU"
              value={`$${result.arpu}`}
              sub="weighted across segments"
            />
            <Stat
              label="Paying accounts"
              value={String(result.payingFreelancers + result.payingStudios)}
              sub={`${result.payingFreelancers} freelancers · ${result.payingStudios} studios`}
            />
          </div>

          <div className="border-hairline bg-surface rounded-xl border p-5 sm:p-6">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-[15px] font-semibold">12-month MRR</h3>
              <span
                className={`text-xs ${declining ? "text-rose-300" : "text-ink-faint"}`}
              >
                {declining ? "declining" : "growing"}
              </span>
            </div>

            <div
              className="mt-4 flex h-32 items-end gap-1"
              role="img"
              aria-label={`Projected MRR from ${usd.format(result.projection[0].mrr)} in month 1 to ${usd.format(result.projection[11].mrr)} in month 12`}
            >
              {result.projection.map((p) => (
                <div
                  key={p.month}
                  title={`Month ${p.month}: ${usd.format(p.mrr)}`}
                  style={{
                    height: `${Math.max(2, (p.mrr / maxProjectionMrr) * 100)}%`,
                  }}
                  className={`flex-1 rounded-t ${declining ? "bg-rose-400/40" : "bg-accent/40"}`}
                />
              ))}
            </div>

            <div className="text-ink-faint mt-2 flex justify-between text-xs">
              <span>M1 · {usd.format(result.projection[0].mrr)}</span>
              <span>M12 · {usd.format(result.projection[11].mrr)}</span>
            </div>
          </div>

          <div className="border-hairline bg-surface rounded-xl border p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={save}
                disabled={saveState === "saving" || saveState === "saved"}
                className="bg-accent focus-visible:ring-accent rounded-lg px-4 py-2 text-sm font-medium text-app transition-opacity disabled:cursor-not-allowed disabled:opacity-40 focus-visible:ring-2 focus-visible:outline-none"
              >
                {saveState === "saved"
                  ? "Saved ✓"
                  : saveState === "saving"
                    ? "Saving…"
                    : "Save this scenario"}
              </button>
              <span className="text-ink-faint text-xs">
                Inputs and results are both stored, so a saved scenario can be
                recomputed and checked.
              </span>
            </div>
            {saveError && (
              <p role="alert" className="mt-3 text-sm text-rose-300">
                {saveError}
              </p>
            )}
          </div>

          <p className="text-ink-faint text-xs leading-relaxed">
            Peso figures use a fixed rate of {USD_TO_MXN} MXN per USD, dated{" "}
            {FX_DATE}. Revenue is gross — the per-stamp cost of issuing a CFDI
            through a PAC is not modelled, because no sourced figure was
            available.
          </p>
        </div>
      </div>
    </section>
  );
}
