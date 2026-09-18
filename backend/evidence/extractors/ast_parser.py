import ast
import hashlib
from pathlib import Path
from typing import Any, Dict, List, Optional

from ..models import Evidence, Provenance

HTTP_DECORATORS = {
    "get": "GET",
    "post": "POST",
    "put": "PUT",
    "patch": "PATCH",
    "delete": "DELETE",
    "head": "HEAD",
    "options": "OPTIONS",
}

def evidence_id(
    repo_id: str,
    path: str,
    line: int,
    symbol: str,
) -> str:
    raw = f"{repo_id}:{path}:{line}:{symbol}"
    return "ev_" + hashlib.sha256(
        raw.encode()
    ).hexdigest()[:16]


def _annotation_to_string(
    annotation: Optional[ast.AST],
) -> Optional[str]:
    if annotation is None:
        return None

    try:
        return ast.unparse(annotation)
    except Exception:
        return None


def _constant_value(node: Optional[ast.AST]) -> Any:
    if node is None:
        return None

    if isinstance(node, ast.Constant):
        return node.value

    if isinstance(node, (ast.List, ast.Tuple)):
        return [
            _constant_value(item)
            for item in node.elts
        ]

    try:
        return ast.unparse(node)
    except Exception:
        return None

def _extract_decorator(
    decorator: ast.AST,
) -> Optional[Dict[str, Any]]:
    if isinstance(decorator, ast.Call):
        function = decorator.func

        if isinstance(function, ast.Attribute):
            name = function.attr

        elif isinstance(function, ast.Name):
            name = function.id
        else:
            return None

        if name not in HTTP_DECORATORS:
            return None

        method = HTTP_DECORATORS[name]
        path = None

        if decorator.args:
            path = _constant_value(
                decorator.args[0]
            )
        status_code = None

        for keyword in decorator.keywords:
            if keyword.arg == "status_code":
                status_code = _constant_value(
                    keyword.value
                )
        return {
            "method": method,
            "path": path,
            "status_code": status_code,
        }
    return None

def _extract_parameters(
    node: ast.FuntionDef,
) -> List[Dict[str, Any]]:
    parameters = []
    positional = (
        list(node.args.posonlyargs)
        + list(node.args.args)
    )
    defaults = (
        [None] * (
            len(positional)
            - len(node.args.defaults)
        )
        + list(node.args.default)
    )
    for argument, default in zip (
        positional,
        defaults,
    ):
        parameters.append(
            {
                "name": argument.arg,
                "type": _annotation_to_string(
                    argument.annotation
                ),
                "required": default is None,
            }
        )
    for argument in node.args.kwonlyargs:
        default = node.args.kw_defaults[
            node.args.kwonlyargs.index(argument)
        ]
        parameters.append(
            {
                "name": argument.arg,
                "type": _annotation_to_string(
                    argument.annotation
                ),
                "required": default is None,
            }
        )
    return parameters

def extract_python_file
