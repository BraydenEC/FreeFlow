/*
  The one FreeFlow mark (L3: the sign-in pages had an "F" tile while the rest
  of the site used this glyph). A shape rather than a letter, so it reads as a
  logo at 28px instead of as text.
*/
export default function Logo({ wordmark = false }: { wordmark?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="bg-ink flex h-7 w-7 shrink-0 items-center justify-center rounded-md">
        <svg viewBox="0 0 24 24" className="text-app h-4 w-4" aria-hidden>
          <path d="M4 20V7a3 3 0 0 1 3-3h13L4 20Z" fill="currentColor" />
        </svg>
      </span>
      {wordmark && (
        <span className="text-[15px] font-semibold tracking-tight">
          Free<span className="text-ink-muted">Flow</span>
        </span>
      )}
    </span>
  );
}
