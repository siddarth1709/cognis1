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
      citations: result.citations,
      contradiction_warning: result.contradiction_warning,
      model_used: result.modelUsed,
      confidence: result.confidence,
      source: result.source,
    };

    return NextResponse.json(responsePayload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process copilot query via Bedrock" },
      { status: 500 }
    );
  }
}
