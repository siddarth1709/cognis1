import { NextResponse } from "next/server";
import { getLocalInvestigation } from "@/lib/local-investigations";

const runtimeUrl = process.env.COGNIS_API_URL?.replace(/\/$/, "");
const runtimeApiKey = process.env.COGNIS_API_KEY;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ investigationId: string }> },
) {
  const { investigationId } = await params;
  if (!runtimeUrl) {
    const record = getLocalInvestigation(investigationId);
    return record ? NextResponse.json(record) : NextResponse.json({ error: "Investigation not found." }, { status: 404 });
  }
  if (!runtimeApiKey) {
    return NextResponse.json({ error: "COGNIS_API_KEY is required when using the AWS runtime." }, { status: 500 });
  }
  try {
    const query = new URL(request.url).searchParams.get("document") === "live" ? "?document=live" : "";
    const response = await fetch(`${runtimeUrl}/v1/investigations/${encodeURIComponent(investigationId)}${query}`, {
      headers: { "x-cognis-api-key": runtimeApiKey },
      cache: "no-store",
    });
    const body = await response.json().catch(() => ({ error: "The runtime returned an invalid response." }));
    return NextResponse.json(body, { status: response.status });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the Cognis runtime. Check COGNIS_API_URL and the runtime availability." },
      { status: 502 },
    );
  }
}
