from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List


LANGUAGE_EXTENSIONS = {
    ".py": "python",
    ".js": "javascript",
    ".jsx": "javascript",
    ".mjs": "javascript",
    ".cjs": "javascript",
    ".ts": "typescript",
    ".tsx": "typescript",
    ".java": "java",
    ".go": "go",
    ".rs": "rust",
    ".cs": "csharp",
    ".c": "c",
    ".h": "c",
    ".cc": "cpp",
    ".cpp": "cpp",
    ".cxx": "cpp",
    ".hpp": "cpp",
    ".rb": "ruby",
    ".php": "php",
}


MANIFEST_LANGUAGES = {
    "pyproject.toml": "python",
    "requirements.txt": "python",
    "setup.py": "python",
    "package.json": "javascript",
    "tsconfig.json": "typescript",
    "pom.xml": "java",
    "build.gradle": "java",
    "build.gradle.kts": "java",
    "go.mod": "go",
    "Cargo.toml": "rust",
    "*.csproj": "csharp",
    "Gemfile": "ruby",
    "composer.json": "php",
}


IGNORED_DIRECTORIES = {
    ".git",
    ".venv",
    "venv",
    "node_modules",
    "__pycache__",
    "target",
    "dist",
    "build",
    ".next",
    ".idea",
    ".vscode",
}


@dataclass
class RepositoryProfile:
    root: str
    languages: List[str] = field(default_factory=list)
    files_by_language: Dict[str, List[str]] = field(
        default_factory=dict
    )
    manifests: List[str] = field(default_factory=list)

    def to_dict(self):
        return {
            "root": self.root,
            "languages": self.languages,
            "files_by_language": self.files_by_language,
            "manifests": self.manifests,
        }


def detect_repository(
    root: str,
) -> RepositoryProfile:

    root_path = Path(root)

    files_by_language: Dict[str, List[str]] = {}
    manifests: List[str] = []

    for path in root_path.rglob("*"):
        if not path.is_file():
            continue

        if _is_ignored(path, root_path):
            continue

        relative = str(
            path.relative_to(root_path)
        )

        language = LANGUAGE_EXTENSIONS.get(
            path.suffix.lower()
        )

        if language:
            files_by_language.setdefault(
                language,
                [],
            ).append(relative)

        if _is_manifest(path):
            manifests.append(relative)

    languages = sorted(files_by_language.keys())

    for manifest in manifests:
        language = _manifest_language(
            Path(manifest).name
        )

        if language and language not in languages:
            languages.append(language)

    return RepositoryProfile(
        root=str(root_path.resolve()),
        languages=sorted(set(languages)),
        files_by_language=files_by_language,
        manifests=sorted(manifests),
    )


def _is_ignored(
    path: Path,
    root: Path,
) -> bool:

    relative_parts = path.relative_to(root).parts

    return any(
        part in IGNORED_DIRECTORIES
        for part in relative_parts
    )


def _is_manifest(
    path: Path,
) -> bool:

    name = path.name

    if name in MANIFEST_LANGUAGES:
        return True

    if name.endswith(".csproj"):
        return True

    return False


def _manifest_language(
    name: str,
):

    if name.endswith(".csproj"):
        return "csharp"

    return MANIFEST_LANGUAGES.get(name)