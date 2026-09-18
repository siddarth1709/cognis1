from __future__ import annotations

from pathlib import Path
from typing import Iterable, List

from ..models import Evidence
from ..normalizer import stable_evidence_id
from ..provenance import file_provenance


_CI_TERMS = (
    "test",
    "lint",
    "check",
    "build",
    "verify",
    "validate",
    "compile",
    "scan",
)


class CIExtractor:
    name = "ci"

    def extract(
        self,
        root: Path,
        files: Iterable[Path],
        repository: str | None,
        commit: str | None,
    ) -> List[Evidence]:
        result: List[Evidence] = []

        for path in files:
            try:
                text = path.read_text(
                    encoding="utf-8"
                )
            except (
                OSError,
                UnicodeDecodeError,
            ):
                continue

            relative = path.relative_to(
                root
            )

            lower_path = (
                relative.as_posix().lower()
            )

            lower_text = text.lower()

            path_signal = any(
                term in lower_path
                for term in (
                    "workflow",
                    "pipeline",
                    "ci",
                    "build",
                )
            )

            command_signals = [
                term
                for term in _CI_TERMS
                if term in lower_text
            ]

            if not path_signal and not command_signals:
                continue

            value = {
                "path_signal": path_signal,
                "observed_commands": command_signals,
            }

            provenance = file_provenance(
                repository=repository,
                commit=commit,
                path=relative,
                source_type="ci",
                extractor=self.name,
            )

            evidence_id = stable_evidence_id(
                "ci",
                relative.as_posix(),
                "contains_automation_signals",
                value,
                provenance.file or "",
            )

            result.append(
                Evidence(
                    id=evidence_id,
                    kind="ci",
                    subject=relative.as_posix(),
                    predicate="contains_automation_signals",
                    value=value,
                    provenance=provenance,
                    confidence=0.7,
                    tags=[
                        "ci",
                        "automation",
                    ],
                )
            )

        return result