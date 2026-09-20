import { NextRequest, NextResponse } from "next/server";
import { sealGitHubToken } from "@/lib/github-connection";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const stateCookie = request.cookies.get("cognis_github_state")?.value;
  const clientId = process.env.AUTH_GITHUB_ID || process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.AUTH_GITHUB_SECRET || process.env.GITHUB_CLIENT_SECRET;
  const destination = new URL("/dashboard", request.url);
  if (!code || !state || state !== stateCookie || !clientId || !clientSecret) {
    destination.searchParams.set("github", "connection-failed");
    return NextResponse.redirect(destination);
  }
  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST", headers: { Accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }), cache: "no-store",
  });
  const token = (await tokenResponse.json() as { access_token?: string }).access_token;
  if (!token) { destination.searchParams.set("github", "connection-failed"); return NextResponse.redirect(destination); }
  destination.searchParams.set("github", "connected");
  const response = NextResponse.redirect(destination);
  response.cookies.set("cognis_github_token", sealGitHubToken(token), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 30, path: "/" });
  response.cookies.delete("cognis_github_state");
  return response;
}
