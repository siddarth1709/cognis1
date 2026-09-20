import { NextResponse } from "next/server";
import { queryCognisBedrock, type BedrockQueryResult } from "@/lib/bedrock-service";

export interface Citation {
  file: string;
  lineRange?: string;
  snippet: string;
  type: "code" | "documentation" | "manifest" | "test";
}

export interface CopilotResponse {
  answer: string;
  brief_explanation: string;
  citations: Citation[];
  contradiction_warning?: {
    subject: string;
    reason: string;
    doc_file: string;
    code_file: string;
  };
  model_used?: string;
  confidence?: number;
  source?: string;
}

function briefExplanation(answer: string): string {
  const paragraph = answer
    .replace(/```[\s\S]*?```/g, "")
    .split(/\n\s*\n/)
    .map((part) => part.replace(/^#{1,6}\s+/, "").replace(/[*`_]/g, "").trim())
    .find((part) => part.length > 45);

  if (!paragraph) {
    return "Cognis compared the available documentation and implementation evidence, then returned the strongest supported conclusion.";
  }
  return paragraph.length > 300 ? `${paragraph.slice(0, 297).trim()}…` : paragraph;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      question?: string;
      owner?: string;
      repository?: string;
      context?: string;
    };
    const question = body.question?.trim();

    if (!question) {
      return NextResponse.json({ error: "Question parameter is required" }, { status: 400 });
    }

    const result: BedrockQueryResult = await queryCognisBedrock({
      question,
      owner: body.owner,
      repository: body.repository,
      context: body.context,
    });

    const responsePayload: CopilotResponse = {
      answer: result.answer,
      brief_explanation: briefExplanation(result.answer),
      citations: result.citations,
      contradiction_warning: result.contradiction_warning,
      model_used: result.modelUsed,
      confidence: result.confidence,
      source: result.source,
    };

    return NextResponse.json(responsePayload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process the Cognis reasoning request" },
      { status: 500 }
    );
  }
}
