"""
The six-stage pipeline, wired end to end.

Observe (caller-supplied repo path) -> Understand (EvidencePipeline) ->
Reason + Challenge (CognisAgentLoop, one investigation per contradiction) ->
Decide (confidence-gated autonomy dial) -> Verify -> Publish (HealTransaction,
patched to disk and fed into Immune Memory).

Nothing else in backend/ strings the stage modules together — this is that
caller. lambda_handlers/webhook_receiver.py's TODO becomes a call to
run_pipeline() once a repo checkout step exists in front of it.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional

from evidence.pipeline import EvidencePipeline
from evidence.graph import EvidenceGraph

from contracts.extractor import (
    extract_contracts,
    extract_retry_contracts,
    RetryContract,
)
from contracts.resolver import (
    resolve_all,
    contradictions,
    resolve_retry_contract,
    ResolvedContract,
    ResolvedRetryContract,
    STATUS_CONTRADICTION,
)

from agent import CognisAgentLoop, BedrockModelClient, default_registry
from agent.bedrock_client import ModelClient
from agent.tools import SandboxRunner, SubprocessSandboxRunner

from healing.planner import plan_doc_repair, HealPlan
from healing.patcher import apply_patch
from healing.transaction import (
    HealTransaction,
    open_transaction,
    mark_verified,
    mark_patched,
    STATUS_PATCHED,
)
from healing.immune_memory import generate_check, RegressionCheck

DEFAULT_AUTONOMY_THRESHOLD = 0.75

_DOC_SUFFIXES = {".md", ".mdx", ".rst"}
_SOURCE_SUFFIXES = {".py", ".ts", ".tsx", ".js", ".jsx", ".go", ".java"}


@dataclass
class PipelineResult:
    repo_root: str
    resolved_contracts: List[ResolvedContract]
    resolved_retry_contracts: List[ResolvedRetryContract]
    transactions: List[HealTransaction]
    regression_checks: List[RegressionCheck]
    escalated: List[str] = field(default_factory=list)


def _read_retry_candidate_texts(repo_root: Path) -> tuple[dict, dict]:
    skip_dirs = {"node_modules", ".git", "__pycache__", ".venv", "dist", "build"}
    doc_texts, source_texts = {}, {}

    for path in repo_root.rglob("*"):
        if not path.is_file() or any(part in skip_dirs for part in path.parts):
            continue
        rel = str(path.relative_to(repo_root))
        if path.suffix in _DOC_SUFFIXES:
            doc_texts[rel] = path.read_text(encoding="utf-8", errors="ignore")
        elif path.suffix in _SOURCE_SUFFIXES:
            source_texts[rel] = path.read_text(encoding="utf-8", errors="ignore")

    return doc_texts, source_texts


def run_pipeline(
    repo_root: Path,
    repo_name: str,
    model_client: Optional[ModelClient] = None,
    autonomy_threshold: float = DEFAULT_AUTONOMY_THRESHOLD,
    sandbox_runner: Optional[SandboxRunner] = None,
    apply_patches: bool = True,
) -> PipelineResult:
    model_client = model_client or BedrockModelClient()
    sandbox_runner = sandbox_runner or SubprocessSandboxRunner(runtimes={"python": ["python3"]})
    repo_root = Path(repo_root)

    evidence_result = EvidencePipeline().analyze(root=str(repo_root), repository=repo_name)
    graph: EvidenceGraph = evidence_result.graph

    resolved = resolve_all(extract_contracts(graph))
    structural_contradictions = contradictions(resolved)

    doc_texts, source_texts = _read_retry_candidate_texts(repo_root)
    retry_contracts: List[RetryContract] = extract_retry_contracts(doc_texts, source_texts)
    resolved_retry = [resolve_retry_contract(rc) for rc in retry_contracts]
    retry_contradictions = [r for r in resolved_retry if r.status == STATUS_CONTRADICTION]

    registry = default_registry(graph=graph, sandbox_runner=sandbox_runner)

    transactions: List[HealTransaction] = []
    checks: List[RegressionCheck] = []
    escalated: List[str] = []

    for resolved_contract in structural_contradictions:
        _investigate_and_heal(
            contract_id=resolved_contract.contract.contract_id,
            subject=resolved_contract.contract.subject,
            predicate=resolved_contract.contract.predicate,
            reason=resolved_contract.reason,
            plan=plan_doc_repair(resolved_contract),
            model_client=model_client, registry=registry,
            autonomy_threshold=autonomy_threshold, repo_root=repo_root,
            apply_patches=apply_patches,
            transactions=transactions, checks=checks, escalated=escalated,
        )

    for rrc in retry_contradictions:
        plan = HealPlan(
            contract_id=rrc.contract.contract_id,
            target_file=rrc.contract.doc_file,
            find_text=str(rrc.contract.doc_value),
            replace_text=str(rrc.contract.code_value),
            rationale=rrc.reason,
            confidence=0.9,
        )
        _investigate_and_heal(
            contract_id=rrc.contract.contract_id,
            subject="RetryPolicy",
            predicate="retry_count",
            reason=rrc.reason,
            plan=plan,
            model_client=model_client, registry=registry,
            autonomy_threshold=autonomy_threshold, repo_root=repo_root,
            apply_patches=apply_patches,
            transactions=transactions, checks=checks, escalated=escalated,
        )

    return PipelineResult(
        repo_root=str(repo_root),
        resolved_contracts=resolved,
        resolved_retry_contracts=resolved_retry,
        transactions=transactions,
        regression_checks=checks,
        escalated=escalated,
    )


def _investigate_and_heal(
    *, contract_id, subject, predicate, reason, plan,
    model_client, registry, autonomy_threshold, repo_root, apply_patches,
    transactions, checks, escalated,
) -> None:
    loop = CognisAgentLoop(model_client, registry)
    investigation = loop.run({
        "contract_id": contract_id, "subject": subject,
        "predicate": predicate, "reason": reason,
    })

    confidence = investigation.confidence or 0.0

    if investigation.verdict != "confirmed_drift" or confidence < autonomy_threshold or plan is None:
        escalated.append(contract_id)
        return

    tx = open_transaction(plan)

    tx = mark_verified(tx, verified=True, detail={
        "investigation_id": investigation.investigation_id,
        "confidence": confidence,
        "summary": investigation.summary,
    })

    if apply_patches:
        patch_result = apply_patch(repo_root, plan)
        tx = mark_patched(tx, patch_result)
        if tx.status == STATUS_PATCHED:
            checks.append(generate_check(tx, subject=subject, predicate=predicate))

    transactions.append(tx)