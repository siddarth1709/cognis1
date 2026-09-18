from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, Iterable, List

from ..models import Evidence
from ..normalizer import stable_evidence_id
from ..provenance import file_provenance


_SCHEMA_KEYS = {
    "openapi",
    "swagger",
    "$schema",
    "definitions",
    "$defs",
    "components",
    "paths",
    "schemas",
    "type",
    "properties",
    "required",
    "queries",
    "mutations",
    "subscriptions",
}


class SchemaExtractor:
    name = "schemas"

    def extract(
        self,
        root: Path,
        manifests: Iterable[object],
        repository: str | None,
        commit: str | None,
    ) -> List[Evidence]:
        result: List[Evidence] = []

        for manifest in manifests:
            data = getattr(
                manifest,
                "data",
                None,
            )

            path = getattr(
                manifest,
                "path",
                None,
            )

            if not isinstance(
                data,
                (dict, list),
            ):
                continue

            if not self._looks_structured(
                data
            ):
                continue

            relative = Path(
                path
            ).relative_to(root)

            structure = self._structure(
                data
            )

            subject = relative.as_posix()

            provenance = file_provenance(
                repository=repository,
                commit=commit,
                path=relative,
                source_type="schema",
                extractor=self.name,
            )

            evidence_id = stable_evidence_id(
                "schema",
                subject,
                "contains_schema_structure",
                structure,
                provenance.file or "",
            )

            result.append(
                Evidence(
                    id=evidence_id,
                    kind="schema",
                    subject=subject,
                    predicate="contains_schema_structure",
                    value=structure,
                    provenance=provenance,
                    confidence=0.9,
                    tags=[
                        "schema",
                        "contract",
                    ],
                )
            )

        return result

    def _looks_structured(
        self,
        data: Any,
    ) -> bool:
        keys = set()

        self._collect_keys(
            data,
            keys,
        )

        return bool(
            keys.intersection(
                _SCHEMA_KEYS
            )
        )

    def _collect_keys(
        self,
        value: Any,
        output: set,
    ) -> None:
        if isinstance(value, dict):
            for key, child in value.items():
                output.add(str(key))

                self._collect_keys(
                    child,
                    output,
                )

        elif isinstance(value, list):
            for child in value:
                self._collect_keys(
                    child,
                    output,
                )

    def _structure(
        self,
        value: Any,
        depth: int = 0,
    ) -> Any:
        if depth > 8:
            return "<depth-limit>"

        if isinstance(value, dict):
            return {
                str(key): self._structure(
                    child,
                    depth + 1,
                )
                for key, child in value.items()
            }

        if isinstance(value, list):
            return [
                self._structure(
                    child,
                    depth + 1,
                )
                for child in value[:100]
            ]

        if isinstance(
            value,
            (
                str,
                int,
                float,
                bool,
            ),
        ):
            return value

        return str(value)