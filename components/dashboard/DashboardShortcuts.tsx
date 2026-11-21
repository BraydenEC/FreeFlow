"use client";

import { useEffect } from "react";

/*
  L6: keyboard shortcuts on the dashboard. "n" starts a new project (the form
  listens for #new-project) and "/" jumps to search. Ignored while typing in a
  field, and with any modifier held, so they never steal a keystroke.
*/
export default function DashboardShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      if (e.key === "n") {
        e.preventDefault();
        if (window.location.hash === "#new-project") window.dispatchEvent(new HashChangeEvent("hashchange"));
        else window.location.hash = "new-project";
      } else if (e.key === "/") {
        const search = document.querySelector<HTMLInputElement>('input[type="search"]');
        if (search) {
          e.preventDefault();
          search.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  return null;
}
