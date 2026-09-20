import { NextResponse } from "next/server";

const runtimeUrl = process.env.COGNIS_API_URL?.replace(/\/$/, "");
const runtimeApiKey = process.env.COGNIS_API_KEY;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ investigationId: string }> },
) {
  if (!runtimeUrl || !runtimeApiKey) {
    return NextResponse.json({ error: "The AWS runtime is not configured." }, { status: 503 });
  }

  const { investigationId } = await params;
  try {
    const response = await fetch(
      `${runtimeUrl}/v1/investigations/${encodeURIComponent(investigationId)}?artifact=patched`,
      { headers: { "x-cognis-api-key": runtimeApiKey }, cache: "no-store" },
    );
    const body = await response.json().catch(() => ({ error: "The runtime returned an invalid response." }));
    return NextResponse.json(body, { status: response.status });
  } catch {
    return NextResponse.json({ error: "Could not reach the Cognis runtime." }, { status: 502 });
  }
}
