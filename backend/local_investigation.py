"""Run Cognis evidence extraction against a public GitHub repository locally."""
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
        from evidence.pipeline import EvidencePipeline
        result = EvidencePipeline().analyze(root=repository_root, repository=f"{owner}/{repository}")
        print(json.dumps({
            "summary": {
                "files": len(result.files), "evidence": len(result.evidence), "manifests": len(result.manifests),
            },
            "transactions": [],
        }))


if __name__ == "__main__":
    main()
