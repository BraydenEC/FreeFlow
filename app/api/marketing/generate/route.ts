import { NextResponse } from "next/server";
import { generateCampaign } from "@/lib/marketing/engine";

/*
  POST /api/marketing/generate

  Returns a full marketing campaign, labelled with its provenance. Always 200:
  falling back to the seed campaign is a successful outcome, and the caller
  distinguishes the paths by reading `provenance`, never by status — the exact
  contract /api/core/extract uses. The model key stays server-side.
*/

export const dynamic = "force-dynamic";

export async function POST() {
  const content = await generateCampaign();
  return NextResponse.json(content, { status: 200 });
}
