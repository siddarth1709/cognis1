from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Iterator, Optional

try:
    import yaml
except ImportError:
    yaml = None


@dataclass(frozen=True)
class ManifestRecord:
    path: Path
    format: str
    data: Any


def _load_json(
    path: Path,
) -> Optional[Any]:
    try:
        return json.loads(
            path.read_text(
                encoding="utf-8"
            )
        )
    except (
        OSError,
        ValueError,
        UnicodeDecodeError,
    ):
        return None


def _load_yaml(
    path: Path,
) -> Optional[Any]:
    if yaml is None:
        return None

    try:
        return yaml.safe_load(
            path.read_text(
                encoding="utf-8"
            )
        )
    except (
        OSError,
        ValueError,
        UnicodeDecodeError,
        yaml.YAMLError,
    ):
        return None


def discover_manifests(
    root: str | Path,
) -> Iterator[ManifestRecord]:
    repository = Path(root).resolve()

    for path in repository.rglob("*"):
        if not path.is_file():
            continue

        try:
            relative = path.relative_to(
                repository
            )
        except ValueError:
            continue

        if ".git" in relative.parts:
            continue

        suffix = path.suffix.lower()

        if suffix == ".json":
            data = _load_json(path)

            if data is not None:
                yield ManifestRecord(
                    path=path,
                    format="json",
                    data=data,
                )

        elif suffix in {
            ".yaml",
            ".yml",
        }:
            data = _load_yaml(path)

            if data is not None:
                yield ManifestRecord(
                    path=path,
                    format="yaml",
                    data=data,
                )
