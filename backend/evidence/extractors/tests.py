from __future__ import annotations

from pathlib import Path
from typing import Iterable, List

from ..models import Evidence
from ..normalizer import stable_evidence_id
from ..provenance import file_provenance


_TEST_PATH_TERMS = (
    "test",
    "spec",
    "__tests__",
)


class TestExtractor:
    name = "tests"

    def extract(
        self,
        root: Path,
        files: Iterable[Path],
        repository: str | None,
        commit: str | None,
    ) -> List[Evidence]:
        result: List[Evidence] = []

        for path in files:
            relative = path.relative_to(root)
            relative_name = relative.as_posix().lower()
            if not any(term in relative_name for term in _TEST_PATH_TERMS):
                continue

            value = {
                "path": relative.as_posix(),
                "test_signal": True,
            }
            provenance = file_provenance(
                repository=repository,
                commit=commit,
                path=relative,
                source_type="test",
                extractor=self.name,
            )
            evidence_id = stable_evidence_id(
                "test",
                relative.as_posix(),
                "contains_test_file",
                value,
                provenance.file or "",
            )
            result.append(
                Evidence(
                    id=evidence_id,
                    kind="test",
                    subject=relative.as_posix(),
                    predicate="contains_test_file",
                    value=value,
                    provenance=provenance,
                    confidence=0.8,
                    tags=["test", "verification"],
                )
            )

        return result