"use client";

import { TAX_REGIMES, TAX_REGIME_LABELS } from "@/lib/tax/withholding";
import { CURRENCIES, CURRENCY_CODES } from "@/lib/currency";
import { useEffect } from "react";
import { usePrefs } from "@/components/prefs/PrefsProvider";
import { WIDGET_LABELS } from "@/lib/prefs/schema";

/*
  The customisation drawer.

  Everything a user can change lives here and nowhere else, so the rest of the
  interface stays free of settings chrome. Opens from the Settings item in the
  sidebar — inert since Week 0 — which now leads somewhere.

  Full-height sheet on every screen size, because the person who asked for
  this said the site was annoying on mobile and a drawer that only works on a
  laptop would miss the point.
*/

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-2.5">
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        {hint && <span className="text-ink-faint block text-xs">{hint}</span>}
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-accent mt-0.5 h-4 w-4 shrink-0"
      />
    </label>
  );
}

export default function LayoutDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const p = usePrefs();

  // Escape closes; body scroll locks while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const widgets = p.prefs.dashboard.widgets;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
      <button
        type="button"
        aria-label="Close settings"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />
      <aside className="bg-surface border-hairline absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l shadow-2xl">
        <div className="border-hairline flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 id="drawer-title" className="text-[15px] font-semibold">
              Layout
            </h2>
            <p className="text-ink-faint text-xs">
              Saved on this device. Nothing leaves your browser.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-muted hover:text-ink focus-visible:ring-accent rounded-lg px-2 py-1 text-sm focus-visible:ring-2 focus-visible:outline-none"
          >
            Done
          </button>
        </div>

        
          {/* The default that applies to any project not setting its own. */}
          <div>
            <label
              htmlFor="prefs-terms"
              className="text-ink text-[13px] font-medium"
            >
              Default payment terms
            </label>
            <div className="mt-2 flex items-center gap-2">
              <input
                id="prefs-terms"
                type="number"
                min={0}
                max={365}
                value={p.prefs.defaultTermsDays}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (Number.isFinite(n)) p.setDefaultTermsDays(Math.min(365, Math.max(0, Math.round(n))));
                }}
                className="bg-raised border-hairline text-ink focus-visible:ring-accent w-24 rounded-lg border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
              />
              <span className="text-ink-muted text-sm">days after the deadline</span>
            </div>
            <p className="text-ink-faint mt-1.5 text-[11px]">
              Drives the forecast. A project can override it.
            </p>
          </div>

          {/* Mexican tax regime. Shown to everyone rather than hidden behind a
              currency check, because a freelancer in Mexico may well bill US
              clients in dollars and would never find it. The helper text
              makes it obviously skippable for everyone else. */}
          <div>
            <label
              htmlFor="prefs-regime"
              className="text-ink text-[13px] font-medium"
            >
              Mexican tax regime
            </label>
            <select
              id="prefs-regime"
              value={p.prefs.taxRegime}
              onChange={(e) =>
                p.setTaxRegime(e.target.value as (typeof TAX_REGIMES)[number])
              }
              className="bg-raised border-hairline text-ink focus-visible:ring-accent mt-2 w-full rounded-lg border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            >
              {TAX_REGIMES.map((r) => (
                <option key={r} value={r}>
                  {TAX_REGIME_LABELS[r]}
                </option>
              ))}
            </select>
            <p className="text-ink-faint mt-1.5 text-[11px]">
              Only affects invoices to Mexican companies. RESICO is withheld at
              1.25% ISR, régimen general at 10%. Ignore this if you do not
              invoice in Mexico.
            </p>
          </div>

          {/* Currency. One per account: the dashboard adds amounts together,
              and summing mixed currencies would need conversion, which would
              need live rates this project has argued against carrying. */}
          <div>
            <label
              htmlFor="prefs-currency"
              className="text-ink text-[13px] font-medium"
            >
              Currency
            </label>
            <select
              id="prefs-currency"
              value={p.prefs.currency}
              onChange={(e) =>
                p.setCurrency(e.target.value as (typeof CURRENCY_CODES)[number])
              }
              className="bg-raised border-hairline text-ink focus-visible:ring-accent mt-2 w-full rounded-lg border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            >
              {CURRENCY_CODES.map((c) => (
                <option key={c} value={c}>
                  {c} — {CURRENCIES[c].label}
                </option>
              ))}
            </select>
            <p className="text-ink-faint mt-1.5 text-[11px]">
              Applies everywhere. Amounts are never converted, so this changes
              how your figures are written, not what they are worth.
            </p>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto px-5 py-4">
          <section>
            <h3 className="text-ink-muted text-xs font-medium tracking-wide uppercase">
              Density
            </h3>
            <div role="radiogroup" className="border-hairline mt-2 flex gap-1 rounded-lg border p-1">
              {(["compact", "comfortable"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  role="radio"
                  aria-checked={p.prefs.density === d}
                  onClick={() => p.setDensity(d)}
                  className={`flex-1 rounded-md px-3 py-1.5 text-sm capitalize transition-colors ${
                    p.prefs.density === d
                      ? "bg-accent/15 text-accent-soft"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-ink-muted text-xs font-medium tracking-wide uppercase">
              Reading
            </h3>
            <Toggle
              label="Show reasoning everywhere"
              hint='Expands every "Why" note. Off by default so the pages read as a tool rather than a document.'
              checked={p.prefs.showReasoning}
              onChange={p.setShowReasoning}
            />
          </section>

          <section>
            <h3 className="text-ink-muted text-xs font-medium tracking-wide uppercase">
              Dashboard
            </h3>
            <Toggle
              label="Pin overdue to the top"
              hint="When anything is overdue, it jumps above everything else regardless of order."
              checked={p.prefs.dashboard.pinOverdue}
              onChange={p.setPinOverdue}
            />

            <ul className="border-hairline mt-2 divide-y rounded-lg border">
              {widgets.map((w, i) => (
                <li key={w.id} className="flex items-center gap-2 px-3 py-2">
                  <input
                    type="checkbox"
                    aria-label={`Show ${WIDGET_LABELS[w.id]}`}
                    checked={w.visible}
                    onChange={(e) => p.setWidgetVisible(w.id, e.target.checked)}
                    className="accent-accent h-4 w-4 shrink-0"
                  />
                  <span
                    className={`min-w-0 flex-1 truncate text-sm ${w.visible ? "" : "text-ink-faint"}`}
                  >
                    {WIDGET_LABELS[w.id]}
                  </span>

                  <button
                    type="button"
                    aria-label={`${WIDGET_LABELS[w.id]}: ${w.width === "full" ? "full" : "half"} width, click to toggle`}
                    onClick={() => p.setWidgetWidth(w.id, w.width === "full" ? "half" : "full")}
                    className="border-hairline text-ink-muted hover:text-ink rounded border px-1.5 py-0.5 font-mono text-[11px]"
                    title={w.width === "full" ? "Full width" : "Half width"}
                  >
                    {w.width === "full" ? "▬" : "▪"}
                  </button>

                  <div className="flex flex-col">
                    <button
                      type="button"
                      aria-label={`Move ${WIDGET_LABELS[w.id]} up`}
                      disabled={i === 0}
                      onClick={() => p.moveWidget(w.id, -1)}
                      className="text-ink-muted hover:text-ink px-1 text-[10px] leading-none disabled:opacity-25"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${WIDGET_LABELS[w.id]} down`}
                      disabled={i === widgets.length - 1}
                      onClick={() => p.moveWidget(w.id, 1)}
                      className="text-ink-muted hover:text-ink px-1 text-[10px] leading-none disabled:opacity-25"
                    >
                      ▼
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-ink-faint mt-2 text-xs">
              ▬ full width · ▪ half width. Half-width panels sit side by side on
              wide screens.
            </p>
          </section>
        </div>

        <div className="border-hairline border-t px-5 py-3">
          <button
            type="button"
            onClick={p.reset}
            className="text-ink-faint hover:text-rose-300 text-xs underline underline-offset-2"
          >
            Reset to defaults
          </button>
        </div>
      </aside>
    </div>
  );
}
