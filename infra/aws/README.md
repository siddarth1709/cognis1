# Cognis AWS infrastructure

This stack provides the request-driven AWS execution path for Cognis:

```text
Vercel / GitHub
      |
      v
  API Gateway
      |
      v
 Ingress Lambda
      |
      v
 Step Functions
   |       |
 Observe  Engine
   |       |
   S3    backend/ + Bedrock
   \       /
      Persist
         |
   DynamoDB + S3 --(verified publication gate)--> private S3 --> CloudFront live docs
```

## Important boundary

`backend/` is packaged into a Lambda layer. The infrastructure adapter calls the existing
`backend/orchestrator.py` interface:

```python
run_pipeline(
    repo_root=Path(...),
    repo_name=..., 
    autonomy_threshold=...,
    apply_patches=True,
)
```

No file under `backend/` is changed by this infrastructure.

## Deploy

```bash
sam validate --lint
sam build
sam deploy --guided
```

For later deployments:

```bash
sam build
sam deploy
```

When prompted, supply a unique `CognisApiKey` (at least 32 characters). Set the same value as
the server-only `COGNIS_API_KEY` in the Next.js host. The dashboard proxies that key to AWS;
do not expose it with a `NEXT_PUBLIC_` prefix.

## Live documentation publication gate

`PersistFunction` publishes a versioned Markdown reference only when every candidate
transaction is verified or patched and none is rejected. The publication record, its
repository index, and immutable investigation link are stored in `PublishedDocumentsTable`.
The document itself is stored in a separate private S3 bucket; CloudFront is the only
principal allowed to read that bucket. The investigation result carries the resulting
CloudFront URL, and the Case Files screen exposes it as **Open verified live doc**.

### Deploy before CloudFront account verification

If AWS has not yet enabled CloudFront for the account, deploy with
`EnableCloudFront=false` (the default). Cognis will still create and index verified
documents in private S3 and DynamoDB, but it will not expose a live-document URL.
After AWS verifies the account, update the same stack with `EnableCloudFront=true` to
add the distribution and origin access control without replacing the backend services.

## GitHub repositories

The Observe function downloads a public GitHub branch archive. Private repositories are deliberately
not silently supported by this first adapter; add a Secrets Manager-backed GitHub token before using
private repositories in production.

## Bedrock

The Engine Lambda uses the existing backend Bedrock client. Set `CognisModelId` to a model/inference
profile enabled in the AWS account and region being used.
