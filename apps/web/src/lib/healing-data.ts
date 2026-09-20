export type TransactionStatus = "pending_verification" | "verified" | "patched" | "rejected";

export interface HealPlanDTO { target_file: string; find_text: string; replace_text: string; rationale: string; confidence: number; operation?: "create" | "update"; }
export interface PatchResultDTO { applied: boolean; target_file: string; diff: string | null; error: string | null; }
export interface ResolvedContractDTO { status: "consistent" | "contradiction" | "doc_only" | "code_only" | "unresolved"; }
export interface HealTransactionDTO {
  transaction_id: string; contract_id: string; plan: HealPlanDTO; status: TransactionStatus;
  created_at: number; verified: boolean | null; verification_detail: Record<string, unknown>; patch_result: PatchResultDTO | null;
  investigation_id?: string;
}
export interface PipelineResultDTO {
  transactions?: HealTransactionDTO[];
  resolved_contracts?: ResolvedContractDTO[];
  resolved_retry_contracts?: ResolvedContractDTO[];
  regression_checks?: unknown[];
  escalated?: string[];
}
export interface InvestigationRecordDTO {
  investigation_id: string; status: "SUCCEEDED" | "FAILED" | "RUNNING"; repository: string;
  owner: string; ref: string; created_at: number; result?: PipelineResultDTO; error?: string;
}

const storageKey = (userId: string) => `cognis:investigations:${userId}`;

export function getSavedInvestigationIds(userId: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const ids: unknown = JSON.parse(window.localStorage.getItem(storageKey(userId)) ?? "[]");
    return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === "string") : [];
  } catch { return []; }
}

export function saveInvestigationId(userId: string, investigationId: string) {
  const ids = getSavedInvestigationIds(userId);
  if (!ids.includes(investigationId)) window.localStorage.setItem(storageKey(userId), JSON.stringify([investigationId, ...ids]));
}

export async function getInvestigation(investigationId: string): Promise<InvestigationRecordDTO | null> {
  const response = await fetch(`/api/investigations/${encodeURIComponent(investigationId)}`, { cache: "no-store" });
  if (!response.ok) return null;
  return response.json() as Promise<InvestigationRecordDTO>;
}

export async function getInvestigations(userId: string): Promise<InvestigationRecordDTO[]> {
  const records = await Promise.all(getSavedInvestigationIds(userId).map(getInvestigation));
  return records.filter((record): record is InvestigationRecordDTO => record !== null);
}

export function transactionsFor(records: InvestigationRecordDTO[]): HealTransactionDTO[] {
  return records.flatMap((record) => (record.result?.transactions ?? []).map((transaction) => ({
    ...transaction,
    investigation_id: record.investigation_id,
  })));
}
