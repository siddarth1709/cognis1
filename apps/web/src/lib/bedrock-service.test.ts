import { describe, it } from "node:test";
import assert from "node:assert";
import {
  parseBedrockResponse,
  determineFileType,
  normalizeLineRange,
  extractHeuristicCitations,
} from "./bedrock-service.ts";

describe("bedrock-service dynamic citations", () => {
  it("determines file types accurately", () => {
    assert.strictEqual(determineFileType("tests/test_retry_policy.py"), "test");
    assert.strictEqual(determineFileType("apps/web/src/auth.test.ts"), "test");
    assert.strictEqual(determineFileType("docs/API.md"), "documentation");
    assert.strictEqual(determineFileType("README.md"), "documentation");
    assert.strictEqual(determineFileType("AGENTS.md"), "manifest");
    assert.strictEqual(determineFileType("infra/aws/template.yaml"), "manifest");
    assert.strictEqual(determineFileType("backend/contracts/resolver.py"), "code");
  });

  it("normalizes line ranges properly", () => {
    assert.strictEqual(normalizeLineRange("L25-L42"), "L25-L42");
    assert.strictEqual(normalizeLineRange("lines 25-42"), "L25-L42");
    assert.strictEqual(normalizeLineRange("line 12"), "L12");
    assert.strictEqual(normalizeLineRange("18 to 30"), "L18-L30");
    assert.strictEqual(normalizeLineRange(undefined), undefined);
  });

  it("extracts structured json:metadata citations and strips block from answer", () => {
    const rawText = `### Epistemological Analysis
Cognis observed an invariant divergence between the documentation and runtime code.

\`\`\`json:metadata
{
  "citations": [
    {
      "file": "apps/web/src/app/page.tsx",
      "lineRange": "L15-L35",
      "snippet": "export default function Home() { ... }",
      "type": "code"
    },
    {
      "file": "docs/DEPLOYMENT.md",
      "lineRange": "L8",
      "snippet": "Set NEXT_PUBLIC_API_URL before building",
      "type": "documentation"
    }
  ],
  "contradiction_warning": {
    "subject": "Deployment Env Binding",
    "reason": "Docs specify NEXT_PUBLIC_API_URL, but code reads RUNTIME_API_URL",
    "doc_file": "docs/DEPLOYMENT.md",
    "code_file": "apps/web/src/app/page.tsx"
  },
  "confidence": 0.98
}
\`\`\``;

    const result = parseBedrockResponse(rawText, "anthropic.claude-3-5-sonnet-20241022-v2:0");

    assert.strictEqual(result.citations.length, 2);
    assert.strictEqual(result.citations[0].file, "apps/web/src/app/page.tsx");
    assert.strictEqual(result.citations[0].lineRange, "L15-L35");
    assert.strictEqual(result.citations[1].file, "docs/DEPLOYMENT.md");
    assert.strictEqual(result.citations[1].type, "documentation");

    assert.ok(result.contradiction_warning);
    assert.strictEqual(result.contradiction_warning.subject, "Deployment Env Binding");
    assert.strictEqual(result.confidence, 0.98);

    // Ensure metadata block is stripped from user-facing answer
    assert.ok(!result.answer.includes("```json:metadata"));
    assert.ok(result.answer.includes("### Epistemological Analysis"));
  });

  it("returns zero citations for unrelated answers without citations (no fake retry-policy citations)", () => {
    const rawText = `Transformer self-attention computes scaled dot-product attention across query, key, and value matrices:
$$Attention(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$
This mathematical formulation allows constant-path length dependency modeling.`;

    const result = parseBedrockResponse(rawText, "anthropic.claude-3-5-sonnet-20241022-v2:0");

    // Must NOT return the 3 hardcoded fake retry-policy citations!
    assert.strictEqual(result.citations.length, 0);
    assert.strictEqual(result.contradiction_warning, undefined);
    assert.ok(result.answer.includes("Transformer self-attention"));
  });

  it("heuristically extracts mentioned files when model outputs freeform markdown", () => {
    const rawText = `In \`backend/orchestrator.py\` (lines 84-110), the pipeline triggers contract resolution.
Meanwhile, \`AGENTS.md\` dictates architectural boundary constraints.`;

    const result = parseBedrockResponse(rawText, "anthropic.claude-3-5-sonnet-20241022-v2:0");

    assert.strictEqual(result.citations.length, 2);
    const files = result.citations.map((c) => c.file);
    assert.ok(files.includes("backend/orchestrator.py"));
    assert.ok(files.includes("AGENTS.md"));

    const orchestratorCit = result.citations.find((c) => c.file === "backend/orchestrator.py");
    assert.strictEqual(orchestratorCit?.lineRange, "L84-L110");
    assert.strictEqual(orchestratorCit?.type, "code");

    const agentsCit = result.citations.find((c) => c.file === "AGENTS.md");
    assert.strictEqual(agentsCit?.type, "manifest");
  });

  it("handles standard json code block containing citations", () => {
    const rawText = `Cognis analyzed the DynamoDB event handler stream.

\`\`\`json
{
  "citations": [
    {
      "file": "backend/lambda_handlers/webhook_receiver.py",
      "lineRange": "L12-L40",
      "snippet": "def handler(event, context): pass"
    }
  ]
}
\`\`\``;

    const result = parseBedrockResponse(rawText, "anthropic.claude-3-5-sonnet-20241022-v2:0");
    assert.strictEqual(result.citations.length, 1);
    assert.strictEqual(result.citations[0].file, "backend/lambda_handlers/webhook_receiver.py");
    assert.strictEqual(result.citations[0].lineRange, "L12-L40");
    assert.strictEqual(result.citations[0].type, "code");
    assert.ok(!result.answer.includes("```json"));
  });
});
