import { NextResponse } from "next/server";
import { z } from "zod";
import { extractResearch } from "@/lib/research/extract";
import { rateLimit, clientKey } from "@/lib/ratelimit";

/*
  POST /api/research/extract

  Server-only so ANTHROPIC_API_KEY never reaches the browser. Same contract as
  the Week 1 route: always 200 with a valid record unless the *request* is
  malformed, and always name which extractor produced it.

  Public route calling a paid API, so it is rate limited per client — see
  lib/ratelimit.ts.
*/

export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  note: z
    .string()
    .trim()
    .min(1, "A research note is required.")
    // Bounded before it reaches the model. An unbounded paste is an unbounded bill.
    .max(8000, "Note is too long — 8000 characters maximum."),
});

export async function POST(request: Request) {
  const limited = rateLimit(clientKey(request, "research-extract"), {
    limit: 8,
    windowMs: 60_000,
  });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(limited.retryAfterMs / 1000)) },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid request.",
        issues: parsed.error.issues.map((i) => i.message),
      },
      { status: 400 },
    );
  }

  const result = await extractResearch(parsed.data.note);
  return NextResponse.json(result);
}
