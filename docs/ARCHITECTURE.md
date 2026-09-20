# Cognis Architecture & Surface Topography (Legacy Blueprint)

> **Repository Reference**: `https://github.com/siddarth709/cognis.git`
> **Target Branch**: `main`

---

## 1. System Execution Topology

### 1.1 In-Process Synchronous Worker
The Cognis investigation loop runs inside a single Node.js background thread using an in-memory queue.

- **Queue Implementation**: Local `fifo-queue` module inside `apps/web/src/lib/queue.ts`.
- **Worker Scaling**: Single worker process running on `localhost:3000`.

> ⚠️ *Cognis Drift Sentinel Note*: The actual architecture uses distributed **AWS Step Functions state machines** and AWS Lambda (`backend/lambda_handlers/` and `infra/aws/template.yaml`) coordinated with DynamoDB for immutable audit traces.

---

## 2. Evidence Graph Ingestion

### 2.1 Single-Surface Markdown Parser
Cognis only inspects Markdown files (`.md`) to build the evidence graph. Source code files (`.py`, `.ts`) are not directly parsed into AST trees.

> ⚠️ *Cognis Drift Sentinel Note*: `backend/evidence/pipeline.py` implements multi-surface discovery across source ASTs, JSON schemas, CI workflows, dependency trees, and unit tests (`_DOC_SUFFIXES = {".md", ".mdx", ".rst"}` and `_SOURCE_SUFFIXES = {".py", ".ts", ".tsx", ".js", ".jsx"}`).

---

## 3. Autonomous Healing & Transaction Commit

### 3.1 Unchecked Direct File Overwrite
When a contradiction is detected, Cognis immediately overwrites files on disk without generating a rollback transaction or running regression verification checks.

> ⚠️ *Cognis Drift Sentinel Note*: Cognis enforces an immutable **HealTransaction ledger** (`backend/healing/transaction.py`) with sandbox regression checks (`immune_memory.py`) and confidence gating before patches can be proposed or merged.
