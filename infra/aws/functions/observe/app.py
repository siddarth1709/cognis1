from __future__ import annotations

import json
import os
import re
import urllib.request
from pathlib import PurePosixPath

import boto3

s3 = boto3.client("s3")
BUCKET = os.environ["ARTIFACT_BUCKET"]


def _safe_part(value: str) -> str:
    value = value.strip()
    if not re.fullmatch(r"[A-Za-z0-9_.-]+", value):
        raise ValueError("owner/repository contains unsupported characters")
    return value


def handler(event, context):
    investigation_id = event["investigation_id"]
    owner = _safe_part(event["owner"])
    repository = _safe_part(event["repository"])
    ref = event["ref"].strip()

    if not ref or len(ref) > 255 or "\n" in ref or "\r" in ref:
        raise ValueError("ref is invalid")

    # Public GitHub repository archive. Private-repository support should use a
    # Secrets Manager-backed token rather than placing credentials in code.
    archive_url = (
        f"https://codeload.github.com/{owner}/{repository}/zip/refs/heads/{ref}"
    )

    key = f"investigations/{investigation_id}/repository.zip"
    request = urllib.request.Request(
        archive_url,
        headers={"User-Agent": "cognis-observe/1.0"},
        method="GET",
    )

    with urllib.request.urlopen(request, timeout=90) as response:
        data = response.read()

    if not data.startswith(b"PK"):
        raise RuntimeError("GitHub did not return a ZIP archive")

    s3.put_object(
        Bucket=BUCKET,
        Key=key,
        Body=data,
        ContentType="application/zip",
        Metadata={
            "owner": owner,
            "repository": repository,
            "ref": ref,
            "investigation-id": investigation_id,
        },
    )

    return {
        "investigation_id": investigation_id,
        "repository": f"{owner}/{repository}",
        "ref": ref,
        "bucket": BUCKET,
        "repository_key": key,
        "bytes": len(data),
    }
