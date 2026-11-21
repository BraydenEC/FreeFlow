import { CoreExtractionSchema, type ExtractionResult } from "@/lib/core/schema";

/*
  The brief on /core and its result, kept for the browser tab (H6, M8).

  Testers lost an extraction to a reload, and each loss meant paying for the
  model call again. sessionStorage keeps both until the project is added; it
  is per tab and gone when the tab closes, so a brief never lingers. Storage
  can be blocked (private windows), so every call is wrapped and a failure
  just means no draft.
*/

export type DraftStore = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export type CoreDraft = { brief: string; result: ExtractionResult | null };

const KEY = "freeflow:core-draft";

export function readDraft(store: DraftStore): CoreDraft | null {
  try {
    const raw = store.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CoreDraft>;
    if (typeof parsed.brief !== "string") return null;
    let result: ExtractionResult | null = null;
    if (parsed.result) {
      const fields = CoreExtractionSchema.safeParse(parsed.result.fields);
      const kind = parsed.result.extractor;
      if (fields.success && (kind === "model" || kind === "heuristic")) {
        result = { ...parsed.result, fields: fields.data, extractor: kind };
      }
    }
    return { brief: parsed.brief, result };
  } catch {
    return null;
  }
}

export function writeDraft(store: DraftStore, draft: CoreDraft | null): void {
  try {
    if (draft === null || (!draft.brief && !draft.result)) store.removeItem(KEY);
    else store.setItem(KEY, JSON.stringify(draft));
  } catch {
    // Storage is full or blocked: the page still works, without a draft.
  }
}
