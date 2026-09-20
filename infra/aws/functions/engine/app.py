from __future__ import annotations

import json
import os
import shutil
import sys
import tempfile
import zipfile
from pathlib import Path

import boto3

s3 = boto3.client("s3")
ARTIFACT_BUCKET = os.environ["ARTIFACT_BUCKET"]
DEFAULT_THRESHOLD = float(os.environ.get("DEFAULT_AUTONOMY_THRESHOLD", "0.75"))


def _jsonable(value):
    if value is None or isinstance(value, (str, int, float, bool)):
        return value
    if isinstance(value, Path):
        return str(value)
    if hasattr(value, "to_dict") and callable(value.to_dict):
        return _jsonable(value.to_dict())
    if hasattr(value, "__dict__"):
        return {k: _jsonable(v) for k, v in vars(value).items()}
    if isinstance(value, dict):
        return {str(k): _jsonable(v) for k, v in value.items()}
    if isinstance(value, (list, tuple, set)):
        return [_jsonable(v) for v in value]
    return str(value)


def _find_repo_root(extract_dir: Path) -> Path:
    candidates = [p for p in extract_dir.iterdir() if p.is_dir()]
    if len(candidates) == 1:
        return candidates[0]
    return extract_dir


def _load_backend():
    task_root = Path(os.environ.get("LAMBDA_TASK_ROOT", "."))
    candidates = [task_root, task_root / "backend", Path("/opt/python"), Path(".")]
    for candidate in candidates:
        if str(candidate) not in sys.path:
            sys.path.insert(0, str(candidate))

    try:
        from backend.pipeline import run_pipeline
        return run_pipeline
    except Exception:
        pass

    try:
        from pipeline import run_pipeline
        return run_pipeline
    except Exception:
        pass

    try:
        from backend.orchestrator import run_pipeline
        return run_pipeline
    except Exception:
        pass

    try:
        from orchestrator import run_pipeline
        return run_pipeline
    except Exception:
        pass

    try:
        from evidence.pipeline import EvidencePipeline

        def _evidence_runner(repo_root, repo_name, autonomy_threshold=0.75, apply_patches=True):
            pipeline = EvidencePipeline()
            return pipeline.analyze(root=str(repo_root), repository=repo_name)

        return _evidence_runner
    except Exception as exc:
        raise RuntimeError(
            "Cognis backend could not import pipeline runner"
        ) from exc


def handler(event, context):
    investigation_id = event["investigation_id"]
    observe = event["observe"]
    repository = event["repository"]
    threshold = float(event.get("autonomy_threshold", DEFAULT_THRESHOLD))

    with tempfile.TemporaryDirectory(prefix="cognis-engine-") as tmp:
        tmp_path = Path(tmp)
        archive_path = tmp_path / "repository.zip"
        extract_path = tmp_path / "repo"
        extract_path.mkdir()

        s3.download_file(
            observe["bucket"],
            observe["repository_key"],
            str(archive_path),
        )

        with zipfile.ZipFile(archive_path) as archive:
            archive.extractall(extract_path)

        repo_root = _find_repo_root(extract_path)
        run_pipeline = _load_backend()

        result = run_pipeline(
            repo_root=repo_root,
            repo_name=repository,
            autonomy_threshold=threshold,
            apply_patches=True,
        )

        result_json = _jsonable(result)
        result_key = f"investigations/{investigation_id}/engine-result.json"
        s3.put_object(
            Bucket=ARTIFACT_BUCKET,
            Key=result_key,
            Body=json.dumps(result_json, default=str).encode("utf-8"),
            ContentType="application/json",
        )

        # Store the patched repository as a ZIP only when the engine actually
        # produced files. This is an artifact of the transaction, not a source
        # repository mutation.
        patched_key = None
        patched_zip = tmp_path / "patched-repository.zip"
        with zipfile.ZipFile(patched_zip, "w", zipfile.ZIP_DEFLATED) as archive:
            for path in repo_root.rglob("*"):
                if path.is_file() and ".git" not in path.parts:
                    archive.write(path, path.relative_to(repo_root))

        s3.upload_file(
            str(patched_zip),
            ARTIFACT_BUCKET,
            f"investigations/{investigation_id}/patched-repository.zip",
        )
        patched_key = f"investigations/{investigation_id}/patched-repository.zip"

    return {
        "investigation_id": investigation_id,
        "repository": repository,
        "result_bucket": ARTIFACT_BUCKET,
        "result_key": result_key,
        "patched_repository_key": patched_key,
        "result": result_json,
    }


lambda_handler = handler
