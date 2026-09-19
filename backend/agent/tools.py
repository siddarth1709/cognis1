from __future__ import annotations

import os
import subprocess
import tempfile
from dataclasses import dataclass
from typing import Any, Callable, Optional, Protocol

from evidence.graph import EvidenceGraph


class SandboxRunner(Protocol):
    def run(
        self,
        code: str,
        language: str,
        timeout_seconds: int,
    ) -> dict:
        ...


class ChangelogProvider(Protocol):
    def query(
        self,
        package: str,
        from_version: str,
        to_version: str,
    ) -> dict:
        ...


class PullRequestProvider(Protocol):
    def post_comment(
        self,
        repo: str,
        pr_number: int,
        body: str,
    ) -> dict:
        ...


@dataclass
class Tool:
    name: str
    description: str
    parameters: dict
    fn: Callable[..., dict]


class ToolRegistry:
    def __init__(self):
        self._tools: dict[str, Tool] = {}

    def register(self, tool: Tool) -> None:
        if not tool.name:
            raise ValueError("Tool name cannot be empty.")

        if not callable(tool.fn):
            raise TypeError(f"Tool '{tool.name}' function is not callable.")

        self._tools[tool.name] = tool

    def get(self, name: str) -> Tool:
        if name not in self._tools:
            raise KeyError(
                f"Unknown tool: {name!r}. "
                f"Known tools: {list(self._tools)}"
            )

        return self._tools[name]

    def call(self, name: str, args: dict) -> dict:
        if not isinstance(args, dict):
            raise TypeError("Tool arguments must be a dictionary.")

        tool = self.get(name)
        return tool.fn(**args)

    def catalog(self) -> list[dict]:
        return [
            {
                "name": tool.name,
                "description": tool.description,
                "parameters": tool.parameters,
            }
            for tool in self._tools.values()
        ]


def fetch_evidence(
    subject: str,
    predicate: Optional[str] = None,
    graph: Optional[EvidenceGraph] = None,
) -> dict:
    if graph is None:
        return {
            "subject": subject,
            "predicate": predicate,
            "evidence": [],
            "source": "evidence_graph_unavailable",
        }

    items = graph.by_subject(subject)

    if predicate is not None:
        items = [
            evidence
            for evidence in items
            if evidence.predicate == predicate
        ]

    return {
        "subject": subject,
        "predicate": predicate,
        "evidence": [
            evidence.to_dict()
            for evidence in items
        ],
    }


class SubprocessSandboxRunner:
    def __init__(
        self,
        runtimes: Optional[dict[str, list[str]]] = None,
        working_directory: Optional[str] = None,
        environment: Optional[dict[str, str]] = None,
    ):
        self.runtimes = runtimes or {}
        self.working_directory = working_directory
        self.environment = environment

    def run(
        self,
        code: str,
        language: str,
        timeout_seconds: int,
    ) -> dict:
        if not language:
            return {
                "ran": False,
                "error": "No execution language was provided.",
            }

        command = self.runtimes.get(language)

        if command is None:
            return {
                "ran": False,
                "error": (
                    f"No runtime is configured for language '{language}'."
                ),
                "available_languages": sorted(self.runtimes),
            }

        if timeout_seconds <= 0:
            return {
                "ran": False,
                "error": "timeout_seconds must be greater than zero.",
            }

        suffix = self._file_suffix(language)

        try:
            with tempfile.NamedTemporaryFile(
                mode="w",
                suffix=suffix,
                delete=False,
            ) as temporary_file:
                temporary_file.write(code)
                temporary_file.flush()
                path = temporary_file.name

            executable = [
                *command,
                path,
            ]

            environment = None

            if self.environment is not None:
                environment = {
                    **os.environ,
                    **self.environment,
                }

            result = subprocess.run(
                executable,
                cwd=self.working_directory,
                env=environment,
                capture_output=True,
                text=True,
                timeout=timeout_seconds,
            )

            return {
                "ran": result.returncode == 0,
                "language": language,
                "returncode": result.returncode,
                "stdout": result.stdout[-2000:],
                "stderr": result.stderr[-2000:],
            }

        except subprocess.TimeoutExpired:
            return {
                "ran": False,
                "language": language,
                "error": (
                    f"Execution timed out after "
                    f"{timeout_seconds} seconds."
                ),
            }

        except OSError as error:
            return {
                "ran": False,
                "language": language,
                "error": str(error),
            }

        finally:
            try:
                os.unlink(path)
            except (OSError, UnboundLocalError):
                pass

    @staticmethod
    def _file_suffix(language: str) -> str:
        return f".{language}"


def run_sandbox(
    code: str,
    language: str,
    timeout_seconds: int = 10,
    runner: Optional[SandboxRunner] = None,
) -> dict:
    if runner is None:
        return {
            "ran": False,
            "language": language,
            "error": (
                "No sandbox runtime provider is configured."
            ),
        }

    return runner.run(
        code=code,
        language=language,
        timeout_seconds=timeout_seconds,
    )


def query_changelog(
    package: str,
    from_version: str,
    to_version: str,
    provider: Optional[ChangelogProvider] = None,
) -> dict:
    if provider is None:
        return {
            "package": package,
            "from_version": from_version,
            "to_version": to_version,
            "removed_symbols": [],
            "renamed_symbols": [],
            "source": "changelog_provider_unavailable",
        }

    return provider.query(
        package=package,
        from_version=from_version,
        to_version=to_version,
    )


def post_pr_comment(
    repo: str,
    pr_number: int,
    body: str,
    provider: Optional[PullRequestProvider] = None,
) -> dict:
    if provider is None:
        return {
            "posted": False,
            "repo": repo,
            "pr_number": pr_number,
            "body_preview": body[:200],
            "source": "pull_request_provider_unavailable",
        }

    return provider.post_comment(
        repo=repo,
        pr_number=pr_number,
        body=body,
    )


def default_registry(
    graph: Optional[EvidenceGraph] = None,
    sandbox_runner: Optional[SandboxRunner] = None,
    changelog_provider: Optional[ChangelogProvider] = None,
    pull_request_provider: Optional[PullRequestProvider] = None,
) -> ToolRegistry:
    registry = ToolRegistry()

    registry.register(
        Tool(
            name="fetch_evidence",
            description=(
                "Fetch structured repository evidence for a subject, "
                "optionally narrowed by predicate."
            ),
            parameters={
                "subject": "string",
                "predicate": "string | null",
            },
            fn=lambda subject, predicate=None: fetch_evidence(
                subject=subject,
                predicate=predicate,
                graph=graph,
            ),
        )
    )

    registry.register(
        Tool(
            name="run_sandbox",
            description=(
                "Execute a repository-relevant code example using "
                "a runtime discovered or configured for the repository."
            ),
            parameters={
                "code": "string",
                "language": "string",
                "timeout_seconds": "integer",
            },
            fn=lambda code, language, timeout_seconds=10: run_sandbox(
                code=code,
                language=language,
                timeout_seconds=timeout_seconds,
                runner=sandbox_runner,
            ),
        )
    )

    registry.register(
        Tool(
            name="query_changelog",
            description=(
                "Query dependency change information through the "
                "configured changelog evidence provider."
            ),
            parameters={
                "package": "string",
                "from_version": "string",
                "to_version": "string",
            },
            fn=lambda package, from_version, to_version: query_changelog(
                package=package,
                from_version=from_version,
                to_version=to_version,
                provider=changelog_provider,
            ),
        )
    )

    registry.register(
        Tool(
            name="post_pr_comment",
            description=(
                "Publish an evidence-backed investigation result "
                "through the configured pull-request provider."
            ),
            parameters={
                "repo": "string",
                "pr_number": "integer",
                "body": "string",
            },
            fn=lambda repo, pr_number, body: post_pr_comment(
                repo=repo,
                pr_number=pr_number,
                body=body,
                provider=pull_request_provider,
            ),
        )
    )

    return registry