import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { sealGitHubToken } from "@/lib/github-connection";

export function GET(request: NextRequest) {
  const clientId = process.env.AUTH_GITHUB_ID || process.env.GITHUB_CLIENT_ID;

  // If real GitHub OAuth credentials are not set in environment, fall back to seamless local demo mode
  if (!clientId) {
    const mockToken = "demo_github_token_cognis_2026";
    const sealed = sealGitHubToken(mockToken);
    const redirectUrl = new URL("/dashboard?connected=demo", request.url);
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set("cognis_github_token", sealed, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  }

  const state = randomUUID();
  const callback = new URL("/api/github/callback", request.url);
  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("redirect_uri", callback.toString());
  authorize.searchParams.set("scope", "read:user public_repo");
  authorize.searchParams.set("state", state);

  const response = NextResponse.redirect(authorize);
  response.cookies.set("cognis_github_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });
  return response;
}
