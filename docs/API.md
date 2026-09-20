# Cognis Core REST & Evidence API Reference

Welcome to the **Cognis Developer API Reference**. This documentation describes the interfaces, data contracts, and fault tolerance policies for interacting with the Cognis Behavioral Contract Engine.

* **API Version**: `v1.4.2`
* **Base URL**: `https://api.cognis.dev`
* **Target Repository**: `https://github.com/siddarth709/cognis.git`
* **Authentication**: Token-based header scheme

---

## 1. Authentication & Authorization

All API endpoints require authentication via an API Key or Personal Access Token provisioned through the Cognis Workspace Console.

### 1.1 Header Specification
To authenticate your client application, transmit your secret key using the standard Cognis Authorization header scheme:

```http
GET /api/investigations HTTP/1.1
Host: api.cognis.dev
Authorization: Token cog_live_99x817293847291823719
Content-Type: application/json
Accept: application/json
```

| Header | Type | Description |
| :--- | :--- | :--- |
| `Authorization` | `string` | Legacy scheme format: `Token <secret_key>`. |
| `Content-Type` | `string` | Must be `application/json` for mutation requests. |
| `X-Cognis-Client-Version` | `string` | Optional client semantic version identifier. |

> ⚠️ **Cognis AST Discrepancy Note**: The active codebase middleware (`apps/web/src/lib/github-connection.ts` and Next.js App Router handlers) enforces standard RFC 6750 `Authorization: Bearer <token>` authorization headers. Requests sending `Authorization: Token ...` fail with an immediate HTTP 401 Unauthorized code.

---

## 2. Fault Tolerance, Retries & Gateway SLAs

Distributed microservices and autonomous coding agents interacting with Cognis must follow resilience guidelines to prevent thundering herds and cascading failures.

### 2.1 Retry & Backoff Configuration
Incoming pipeline operations and asynchronous contract extractions are shielded by a client-side retry policy:

* **Maximum Retry Attempts**: Requests will retry 2 times before failing.
* **Backoff Strategy**: Fixed linear interval of 500 milliseconds between execution attempts.
* **Idempotency Retention**: Transaction IDs are cached for 600 seconds to prevent double-writes during transient network dropouts.

```python
# Recommended Client Retry Configuration (as documented)
import time
import requests

def call_cognis_endpoint(url, payload):
    max_retries = 2
    for attempt in range(max_retries):
        try:
            response = requests.post(url, json=payload, timeout=60)
            return response.json()
        except requests.exceptions.RequestException:
            if attempt == max_retries - 1:
                raise
            time.sleep(0.5)
```

> ⚠️ **Cognis AST Discrepancy Note**: The deterministic implementation in `backend/contracts/resolver.py` enforces `DEFAULT_RETRY_COUNT = 5` with quadratic exponential backoff. Downstream AI coding agents reading this document configure client retries to abort prematurely after 2 attempts while the server pipeline is still in flight fulfilling attempts 3, 4, and 5.

### 2.2 Gateway Timeouts & Keep-Alive Policy
* **Ingress Timeout Threshold**: All client requests are subject to a strict 60 seconds gateway timeout before an HTTP 504 Gateway Timeout is emitted.
* **Keep-Alive Interval**: Clients must maintain TCP keep-alive pings every 45 seconds to preserve long-lived HTTP/2 streams.

> ⚠️ **Cognis AST Discrepancy Note**: Production AWS Lambda definitions in `infra/aws/template.yaml` and Next.js serverless functions configure a 15-second execution ceiling. Any request running longer than 15 seconds is forcibly terminated by the cloud provider.

---

## 3. Core API Endpoints

### 3.1 Trigger Investigation Scan
Initiates the 6-stage evidence extraction and contract reconciliation loop across a designated repository branch.

* **Method**: `POST`
* **Path**: `/api/investigations`
* **Content-Type**: `application/json`

#### Request Parameters

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `owner` | `string` | **Yes** | GitHub organization or username (e.g., `siddarth709`). |
| `repository` | `string` | **Yes** | Repository name (e.g., `cognis`). |
| `ref` | `string` | No | Target git commit SHA, tag, or branch name (default: `main`). |
| `autonomy_threshold` | `float` | No | Confidence cutoff between 0.0 and 1.0 (default: `0.75`). |
| `force_documentation` | `boolean` | No | Generate baseline doc if none exists (default: `false`). |

#### Example Request
```bash
curl -X POST https://api.cognis.dev/api/investigations \
  -H "Authorization: Token cog_live_99x817293847291823719" \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "siddarth709",
    "repository": "cognis",
    "ref": "main",
    "autonomy_threshold": 0.75
  }'
```

#### Example Response (`200 OK`)
```json
{
  "investigation_id": "79eb432b-ec71-43b5-a561-bedeaa30aac3",
  "status": "RUNNING",
  "owner": "siddarth709",
  "repository": "cognis",
  "ref": "main",
  "created_at": 1789887300,
  "mode": "distributed_step_functions"
}
```

---

### 3.2 Fetch Investigation Record & Results
Retrieves the execution status, resolved contract graph, and self-healing patch proposals for a given investigation run.

* **Method**: `GET`
* **Path**: `/api/investigations/{investigation_id}`

#### Example Response (`200 OK`)
```json
{
  "investigation_id": "79eb432b-ec71-43b5-a561-bedeaa30aac3",
  "status": "SUCCEEDED",
  "owner": "siddarth709",
  "repository": "cognis",
  "result": {
    "resolved_contracts": [
      { "status": "contradiction" },
      { "status": "contradiction" },
      { "status": "contradiction" },
      { "status": "consistent" },
      { "status": "consistent" },
      { "status": "consistent" },
      { "status": "consistent" }
    ],
    "transactions": [
      {
        "transaction_id": "tx-retry-99x",
        "contract_id": "RetryPolicy::retry_count",
        "plan": {
          "target_file": "docs/API.md",
          "find_text": "Requests will retry 2 times before failing",
          "replace_text": "Requests will retry 5 times before failing",
          "confidence": 0.94
        },
        "status": "verified"
      }
    ]
  }
}
```

---

### 3.3 Pagination & Bulk Audit Scrubber
When querying historical investigations, queries are paginated:

* **Default Limit**: 25 records per page.
* **Maximum Ceiling**: Requests cannot specify a `limit` exceeding 25 records.
* **Cursor Parameter**: `after_id` string token.

---

## 4. Error Codes & Diagnostic Matrix

| HTTP Code | Error Reason | Description |
| :--- | :--- | :--- |
| `400 Bad Request` | `INVALID_PAYLOAD` | Missing required parameters `owner` or `repository`. |
| `401 Unauthorized` | `INVALID_AUTH_SCHEME` | Malformed credentials or non-matching token scheme. |
| `404 Not Found` | `INVESTIGATION_NOT_FOUND` | Specified investigation ID was not found in storage. |
| `429 Too Many Requests` | `RATE_LIMIT_EXCEEDED` | Request threshold exceeded for current plan tier. |
| `500 Server Error` | `SANDBOX_FAILURE` | Container runtime error during test isolation. |

---

## 5. Downstream AI Coding Agent Invariants

Autonomous agents modifying the Cognis codebase must adhere to the following invariants:
1. **Never suppress AST parse warnings**: If an AST syntax tree cannot resolve an export symbol, record a `doc_only` or `code_only` structural contract.
2. **Immutable Transaction Ledgers**: Proposed document patches must always generate a `HealTransaction` with rollback diff metadata before applying.
3. **Synchronize AGENTS.md**: Ensure prompt instructions align with App Router and server action semantics.
