"""Run Cognis evidence extraction and 6-stage investigation pipeline locally."""
from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path


def main() -> None:
    request = json.loads(sys.argv[1])
    owner, repository, ref = request["owner"], request["repository"], request["ref"]
    autonomy_threshold = float(request.get("autonomy_threshold", 0.75))
    force_documentation = bool(request.get("force_documentation", False))

    archive_url = f"https://codeload.github.com/{owner}/{repository}/zip/refs/heads/{ref}"
    with tempfile.TemporaryDirectory(prefix="cognis-local-") as temporary:
        root = Path(temporary)
        archive = root / "repository.zip"
        subprocess.run(
            ["curl", "--fail", "--location", "--silent", "--show-error", "--output", str(archive), archive_url],
            check=True,
        )
        with zipfile.ZipFile(archive) as source:
            source.extractall(root / "repository")
        children = [item for item in (root / "repository").iterdir() if item.is_dir()]
        repository_root = children[0] if len(children) == 1 else root / "repository"
        sys.path.insert(0, str(Path(__file__).parent))

        from orchestrator import run_pipeline

        # Run full Cognis 6-stage pipeline on the repository
        result = run_pipeline(
            repo_root=repository_root,
            repo_name=f"{owner}/{repository}",
            autonomy_threshold=autonomy_threshold,
            apply_patches=False,
            force_documentation=force_documentation,
        )

        resolved_contracts_data = []
        for rc in result.resolved_contracts:
            resolved_contracts_data.append({
                "contract": {
                    "contract_id": rc.contract.contract_id,
                    "subject": rc.contract.subject,
                    "predicate": rc.contract.predicate,
                    "doc_file": rc.contract.doc_evidence[0].file_path if rc.contract.doc_evidence else "N/A",
                    "code_file": rc.contract.code_evidence[0].file_path if rc.contract.code_evidence else "N/A",
                },
                "status": rc.status,
                "reason": rc.reason,
            })

        resolved_retry_data = []
        for rrc in result.resolved_retry_contracts:
            resolved_retry_data.append({
                "contract": {
                    "contract_id": rrc.contract.contract_id,
                    "subject": "RetryPolicy",
                    "predicate": "retry_count",
                    "doc_file": rrc.contract.doc_file,
                    "code_file": rrc.contract.code_file,
                },
                "status": rrc.status,
                "reason": rrc.reason,
            })

        transactions_data = []
        for tx in result.transactions:
            transactions_data.append({
                "transaction_id": tx.transaction_id,
                "contract_id": tx.contract_id,
                "plan": {
                    "target_file": tx.plan.target_file,
                    "find_text": tx.plan.find_text,
                    "replace_text": tx.plan.replace_text,
                    "rationale": tx.plan.rationale,
                    "confidence": tx.plan.confidence,
                    "operation": getattr(tx.plan, "operation", "update"),
                },
                "status": tx.status,
                "created_at": tx.created_at,
                "verified": tx.verified,
                "verification_detail": tx.verification_detail,
                "patch_result": {
                    "applied": tx.patch_result.applied if tx.patch_result else False,
                    "target_file": tx.patch_result.target_file if tx.patch_result else tx.plan.target_file,
                    "diff": tx.patch_result.diff if tx.patch_result else None,
                    "error": tx.patch_result.error if tx.patch_result else None,
                } if tx.patch_result else None,
            })

        regression_checks_data = []
        for chk in result.regression_checks:
            regression_checks_data.append({
                "check_id": chk.check_id,
                "subject": chk.subject,
                "predicate": chk.predicate,
                "test_file": chk.test_file,
            })

        print(json.dumps({
            "repo_root": str(repository_root),
            "resolved_contracts": resolved_contracts_data,
            "resolved_retry_contracts": resolved_retry_data,
            "transactions": transactions_data,
            "regression_checks": regression_checks_data,
            "escalated": result.escalated,
        }))


if __name__ == "__main__":
    main()
