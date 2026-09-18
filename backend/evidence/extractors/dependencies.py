from __future__ import annotations

import re
from pathlib import Path
from typing import Any, Iterable, List

from ..models import Evidence
from ..normalizer import stable_evidence_id
from ..provenance import file_provenance


_DEPENDENCY_KEYS = {
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
    "requires",
    "require-dev",
    "packages",
}


class DependencyExtractor:
    name = "dependencies"

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
                dict,
            ):
                continue

            dependencies = self._extract(
                data
            )

            if not dependencies:
                continue

            relative = Path(
                path
            ).relative_to(root)

            value = {
                "dependencies": dependencies,
                "count": len(
                    dependencies
                ),
            }

            provenance = file_provenance(
                repository=repository,
                commit=commit,
                path=relative,
                source_type="dependency",
                extractor=self.name,
            )

            evidence_id = stable_evidence_id(
                "dependency",
                relative.as_posix(),
                "declares_dependencies",
                value,
                provenance.file or "",
            )

            result.append(
                Evidence(
                    id=evidence_id,
                    kind="dependency",
                    subject=relative.as_posix(),
                    predicate="declares_dependencies",
                    value=value,
                    provenance=provenance,
                    confidence=1.0,
                    tags=[
                        "dependency",
                        "manifest",
                    ],
                )
            )

        return result

    def _extract(
        self,
        data: dict,
    ) -> List[Any]:
        result = []

        for key, value in data.items():
            if key not in _DEPENDENCY_KEYS:
                continue

            if isinstance(
                value,
                dict,
            ):
                for name, version in value.items():
                    result.append(
                        {
                            "name": str(name),
                            "version": str(version),
                            "group": str(key),
                        }
                    )

            elif isinstance(
                value,
                list,
            ):
                for item in value:
                    result.append(
                        {
                            "name": str(item),
                            "group": str(key),
                        }
                    )

            elif isinstance(
                value,
                str,
            ):
                result.append(
                    {
                        "value": value,
                        "group": str(key),
                    }
                )

        return result