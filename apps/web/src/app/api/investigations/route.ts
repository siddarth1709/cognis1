import { NextResponse } from "next/server";
import { startLocalInvestigation } from "@/lib/local-investigations";

const runtimeUrl = process.env.COGNIS_API_URL?.replace(/\/$/, "");
const runtimeApiKey = process.env.COGNIS_API_KEY;

export async function GET() {
  return NextResponse.json({ configured: true, mode: runtimeUrl ? "aws" : "local" });
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!runtimeUrl) {
    const input = payload as {
      owner?: string;
      repository?: string;
      ref?: string;
      autonomy_threshold?: number;
      force_documentation?: boolean;
    };
    if (!input.owner?.trim() || !input.repository?.trim() || !input.ref?.trim()) {
      return NextResponse.json({ error: "Owner, repository, and ref are required." }, { status: 400 });
    }
    const record = startLocalInvestigation({
      owner: input.owner.trim(),
      repository: input.repository.trim(),
      ref: input.ref.trim(),
      autonomy_threshold: input.autonomy_threshold,
      force_documentation: input.force_documentation,
    });
    return NextResponse.json({ investigation_id: record.investigation_id, status: record.status, mode: "local" }, { status: 202 });
  }

  if (!runtimeApiKey) {
    return NextResponse.json({ error: "COGNIS_API_KEY is required when using the AWS runtime." }, { status: 500 });
  }

  try {
    const response = await fetch(`${runtimeUrl}/v1/investigations`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-cognis-api-key": runtimeApiKey },
      body: JSON.stringify(payload),
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
