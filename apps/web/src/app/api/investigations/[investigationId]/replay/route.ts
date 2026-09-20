import { NextResponse } from "next/server";

export interface ReplayStep {
  step_index: number;
  stage: "Observe" | "Understand" | "Reason" | "Challenge" | "Decide" | "Verify" | "Publish";
  timestamp: string;
  thought: string;
  tool_call?: {
    name: string;
    params: Record<string, unknown>;
  };
  tool_output?: string;
  verdict?: string;
  confidence?: number;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ investigationId: string }> }
) {
  try {
    const { investigationId } = await params;

    // Simulate scrubbable audit trail sequence for Cognis Agent loop
    const trajectory: ReplayStep[] = [
      {
        step_index: 0,
        stage: "Observe",
        timestamp: "2026-09-20T10:45:00Z",
        thought: `Triggered investigation webhook for run ${investigationId}. Ingesting repo ASTs and markdown docs.`,
      },
      {
        step_index: 1,
        stage: "Understand",
        timestamp: "2026-09-20T10:45:02Z",
        thought: "Extracted contract graph across code and docs. Parsing retry policies and API schemas.",
        tool_call: {
          name: "fetch_evidence",
          params: { contract_id: "RetryPolicy::retry_count" },
        },
        tool_output:
          "Evidence extracted: doc_value=3 (docs/API.md), code_value=5 (backend/contracts/resolver.py).",
      },
      {
        step_index: 2,
        stage: "Reason",
        timestamp: "2026-09-20T10:45:05Z",
        thought:
          "Cognis Agent reasoning via Bedrock InvokeModel: Behavioral contradiction detected. Doc claims max retries is 3, but code enforces 5. Formulating repair hypothesis.",
      },
      {
        step_index: 3,
        stage: "Challenge",
        timestamp: "2026-09-20T10:45:08Z",
        thought: "Challenging hypothesis against isolated sandbox run and git commit history.",
        tool_call: {
          name: "run_sandbox",
          params: { code_snippet: "pytest backend/tests/test_contracts.py" },
        },
        tool_output: "Sandbox run output: 4 passed, 1 failed (AssertionError: expected retry count 5).",
      },
      {
        step_index: 4,
        stage: "Decide",
        timestamp: "2026-09-20T10:45:12Z",
        thought:
          "Confidence rating calculated as 0.92 (exceeds autonomy threshold 0.75). Auto-heal approved for doc patch.",
        verdict: "confirmed_drift",
        confidence: 0.92,
      },
      {
        step_index: 5,
        stage: "Verify",
        timestamp: "2026-09-20T10:45:15Z",
        thought: "Applied patch to target doc and verified against regression check suite.",
        tool_call: {
          name: "check_regression",
          params: { check_id: "check_retry_policy_val" },
        },
        tool_output: "Immune memory regression check passed. Transaction verified.",
      },
      {
        step_index: 6,
        stage: "Publish",
        timestamp: "2026-09-20T10:45:18Z",
        thought: "HealTransaction locked & published to download/commit ledger.",
        tool_call: {
          name: "post_pr_comment",
          params: { comment: "Cognis PR Sentinel: Repaired retry policy doc drift (3 -> 5)." },
        },
        tool_output: "PR Comment posted successfully.",
      },
    ];

    return NextResponse.json({
      investigation_id: investigationId,
      trajectory,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load replay trajectory" },
      { status: 500 }
    );
  }
}
