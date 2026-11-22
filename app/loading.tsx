/*
  Shown the instant a link is clicked, while a page that renders on demand
  (dashboard, help desk, roadmap, Paste a brief) is on its way. Next.js
  prefetches this fallback, so navigation responds at once instead of
  waiting on the server with nothing on screen.
*/
export default function Loading() {
  return (
    <div role="status" aria-label="Loading" className="mx-auto max-w-5xl page-stack px-5 sm:px-8">
      <div aria-hidden className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden">
        <div className="loading-bar h-full w-1/3 bg-[var(--color-ink-muted)]" />
      </div>
      <div aria-hidden className="flex flex-col gap-3">
        <div className="bg-raised h-7 w-40 animate-pulse rounded" />
        <div className="bg-raised h-4 w-72 max-w-full animate-pulse rounded" />
        <div className="bg-raised mt-4 h-40 w-full animate-pulse rounded-lg" />
      </div>
    </div>
  );
}
