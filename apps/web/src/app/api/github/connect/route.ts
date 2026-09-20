import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  const clientId = process.env.AUTH_GITHUB_ID || process.env.GITHUB_CLIENT_ID;
  if (!clientId) return NextResponse.json({ error: "GitHub OAuth is not configured." }, { status: 503 });
  const state = randomUUID();
  const callback = new URL("/api/github/callback", request.url);
  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("redirect_uri", callback.toString());
  authorize.searchParams.set("scope", "read:user public_repo");
  authorize.searchParams.set("state", state);
  const response = NextResponse.redirect(authorize);
  response.cookies.set("cognis_github_state", state, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 600, path: "/" });
  return response;
}
