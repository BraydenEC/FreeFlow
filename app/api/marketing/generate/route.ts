import { NextResponse } from "next/server";
import { generateCampaign } from "@/lib/marketing/engine";
import { rateLimit, clientKey } from "@/lib/ratelimit";

/*
  POST /api/marketing/generate

  Returns a full marketing campaign, labelled with its provenance. Always 200:
  falling back to the seed campaign is a successful outcome, and the caller
  distinguishes the paths by reading `provenance`, never by status — the exact
  contract /api/core/extract uses. The model key stays server-side.

  This route is public (the marketing page is), and it calls a paid API, so it
  is rate limited per client to cap abuse. See lib/ratelimit.ts for the honest
  limitation and the Upstash upgrade path.
*/

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { ok, retryAfterMs } = rateLimit(clientKey(request, "generate"), {
    limit: 8,
    windowMs: 60_000,
  });
  if (!ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } },
    );
  }

  const content = await generateCampaign();
  return NextResponse.json(content, { status: 200 });
}
