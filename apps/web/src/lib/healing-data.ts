export type TransactionStatus = "pending_verification" | "verified" | "patched" | "rejected";

export interface HealPlanDTO {
  target_file: string;
  find_text: string;
  replace_text: string;
  rationale: string;
  confidence: number;
}

export interface PatchResultDTO {
  applied: boolean;
  target_file: string;
  diff: string | null;
  error: string | null;
}

export interface HealTransactionDTO {
  transaction_id: string;
  contract_id: string;
  plan: HealPlanDTO;
  status: TransactionStatus;
  created_at: number;
  verified: boolean | null;
  verification_detail: Record<string, unknown>;
  patch_result: PatchResultDTO | null;
}

export interface PipelineResultDTO {
  repo_root: string;
  resolved_contracts: unknown[];
  resolved_retry_contracts: unknown[];
  transactions: HealTransactionDTO[];
  regression_checks: unknown[];
  escalated: string[];
}

export interface InvestigationRecordDTO {
  investigation_id: string;
  status: "SUCCEEDED" | "FAILED" | "RUNNING";
  repository: string;
  owner: string;
  ref: string;
  created_at: number;
  result_bucket: string;
  result_key: string;
  patched_repository_key: string | null;
  result: PipelineResultDTO;
}

// Real single-investigation fetch, once an investigation_id is known
// (e.g. returned by POST /v1/investigations when a run is kicked off):
//
//   const res = await fetch(`${API_BASE}/v1/investigations/${investigationId}`);
//   const record = (await res.json()) as InvestigationRecordDTO;
//   return record.result.transactions;
//
// No list-all endpoint exists yet — see the module comment above. Until
// InvestigationsTable gets a GSI (repository + created_at is the obvious
// choice) and a List Lambda/route, this mock stands in for that view.
export async function getHealTransactions(): Promise<HealTransactionDTO[]> {
  return [
    {
      transaction_id: "b3f1c2a0-6e2d-4c9a-9f21-1a2b3c4d5e6f",
      contract_id: "contract:retry:README.md:retry.py",
      plan: {
        target_file: "README.md",
        find_text: "retries 3 times on failure",
        replace_text: "retries 5 times on failure",
        rationale:
          "Code evidence (retry.py, confidence 0.95) shows 5 retry attempts; documentation (README.md) claims 3.",
        confidence: 0.92,
      },
      status: "patched",
      created_at: Date.now() / 1000 - 340,
      verified: true,
      verification_detail: {
        investigation_id: "inv-8827",
        confidence: 0.92,
        summary: "Doc says 3 retries, code implements 5. Sandbox re-run confirms 5 attempts before failure.",
      },
      patch_result: {
        applied: true,
        target_file: "README.md",
        diff:
          "--- a/README.md\n+++ b/README.md\n@@ -1 +1 @@\n-This client retries 3 times on failure.\n+This client retries 5 times on failure.\n",
        error: null,
      },
    },
    {
      transaction_id: "7a92e410-11cd-4c3b-88aa-2d3e4f5a6b7c",
      contract_id: "contract:AuthMiddleware:token_expiry",
      plan: {
        target_file: "docs/auth.md",
        find_text: "tokens expire after 30 minutes",
        replace_text: "tokens expire after 15 minutes",
        rationale:
          "Code evidence (middleware/auth.ts, confidence 0.88) shows a 15-minute expiry constant; documentation claims 30.",
        confidence: 0.81,
      },
      status: "verified",
      created_at: Date.now() / 1000 - 1500,
      verified: true,
      verification_detail: {
        investigation_id: "inv-8811",
        confidence: 0.81,
        summary: "Token TTL constant confirmed via source evidence; doc example not yet patched.",
      },
      patch_result: null,
    },
    {
      transaction_id: "0d4f8b21-5a6c-4e1d-a3f0-9c8b7a6d5e4f",
      contract_id: "contract:RateLimiter:requests_per_minute",
      plan: {
        target_file: "docs/rate-limits.md",
        find_text: "100 requests per minute",
        replace_text: "60 requests per minute",
        rationale:
          "Investigation confidence (0.58) fell below the repo's autonomy threshold (0.75) — routed to human review instead of auto-heal.",
        confidence: 0.58,
      },
      status: "rejected",
      created_at: Date.now() / 1000 - 4200,
      verified: false,
      verification_detail: {
        investigation_id: "inv-8790",
        confidence: 0.58,
        summary: "Conflicting evidence: two rate-limit constants found in different modules.",
      },
      patch_result: null,
    },
  ];
}