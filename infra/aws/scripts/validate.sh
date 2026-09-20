#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

sam validate --lint
python3 -m json.tool statemachine/pipeline.asl.json >/dev/null
python3 -m json.tool schemas/investigation-request.schema.json >/dev/null
python3 -m json.tool events/investigation.example.json >/dev/null

echo "Cognis AWS infrastructure validation passed."
