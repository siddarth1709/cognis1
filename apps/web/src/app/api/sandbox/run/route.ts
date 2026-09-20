import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { code_snippet?: string; language?: string };
    const snippet = body.code_snippet?.trim();

    if (!snippet) {
      return NextResponse.json({ error: "Code snippet parameter is required" }, { status: 400 });
    }

    // Isolated sandbox execution simulation
    const passed = !snippet.includes("broken") && !snippet.includes("raise");
    const output = passed
      ? "[Cognis Sandbox] Executed snippet in isolated python3 environment.\nTest suite: 1 passed in 0.04s."
      : "[Cognis Sandbox Exception] AssertionError: Target function signature mismatched.\nOriginal: func(a, b), Invoked: func(a).";

    return NextResponse.json({
      passed,
      language: body.language || "python",
      output,
      execution_time_ms: 42,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sandbox execution failed" },
      { status: 500 }
    );
  }
}
