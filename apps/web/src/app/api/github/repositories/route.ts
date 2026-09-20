import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { openGitHubToken } from "@/lib/github-connection";

type GitHubRepository = { id: number; full_name: string; name: string; owner: { login: string }; default_branch: string; private: boolean; updated_at: string };

export async function GET() {
  const token = openGitHubToken((await cookies()).get("cognis_github_token")?.value);
  if (!token) return NextResponse.json({ connected: false, repositories: [] });
  const response = await fetch("https://api.github.com/user/repos?affiliation=owner,collaborator,organization_member&sort=updated&per_page=100", { headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28" }, cache: "no-store" });
  if (!response.ok) return NextResponse.json({ connected: false, repositories: [] });
  const repositories = (await response.json() as GitHubRepository[])
    .filter((repository) => !repository.private)
    .map(({ id, full_name, name, owner, default_branch, private: isPrivate, updated_at }) => ({ id, fullName: full_name, name, owner: owner.login, defaultBranch: default_branch, private: isPrivate, updatedAt: updated_at }));
  return NextResponse.json({ connected: true, repositories });
}
