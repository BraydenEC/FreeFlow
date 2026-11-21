import Link from "next/link";

/* M5: unknown URLs showed the stock white 404 on an all-black site. */
export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-start px-5 py-20 sm:px-8">
      <p className="text-ink-faint text-xs font-medium tracking-wide uppercase">404</p>
      <h1 className="page-title mt-2">This page doesn&rsquo;t exist</h1>
      <p className="text-ink-muted mt-2 text-sm">The link may be old, or the address mistyped.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/dashboard" className="bg-accent text-app inline-flex min-h-11 items-center rounded-lg px-4 text-sm font-semibold">
          Go to your dashboard
        </Link>
        <Link href="/" className="border-hairline text-ink inline-flex min-h-11 items-center rounded-lg border px-4 text-sm">
          Home
        </Link>
      </div>
    </main>
  );
}
