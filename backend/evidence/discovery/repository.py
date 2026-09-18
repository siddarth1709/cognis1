from __future__ import annotations

import hashlib
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Optional


@dataclass(frozen=True)
class RepositorySnapshot:
    root: Path
    repository: Optional[str]
    commit: Optional[str]
    branch: Optional[str]
    fingerprint: str
    metadata: Dict[str, object]


def _run_git(
    root: Path,
    args: list[str],
) -> Optional[str]:
    try:
        result = subprocess.run(
            ["git", *args],
            cwd=root,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=True,
        )

        value = result.stdout.strip()

        return value or None

    except (
        OSError,
        subprocess.SubprocessError,
    ):
        return None


def discover_repository(
    root: str | Path,
    repository: Optional[str] = None,
) -> RepositorySnapshot:
    path = Path(root).resolve()

    commit = _run_git(
        path,
        ["rev-parse", "HEAD"],
    )

    branch = _run_git(
        path,
        ["branch", "--show-current"],
    )

    git_remote = _run_git(
        path,
        ["config", "--get", "remote.origin.url"],
    )

    repository_value = (
        repository
        or git_remote
    )

    fingerprint_source = (
        f"{repository_value or ''}:"
        f"{commit or ''}:"
        f"{path}"
    )

    fingerprint = hashlib.sha256(
        fingerprint_source.encode("utf-8")
    ).hexdigest()

    return RepositorySnapshot(
        root=path,
        repository=repository_value,
        commit=commit,
        branch=branch,
        fingerprint=fingerprint,
        metadata={
            "git_remote": git_remote,
        },
    )