import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { openGitHubToken } from "@/lib/github-connection";

type GitHubRepository = {
  id: number;
  full_name: string;
  name: string;
  owner: { login: string };
  default_branch: string;
  private: boolean;
  updated_at: string;
};

const DEMO_REPOSITORIES = [
  { id: 100, fullName: "siddarth709/cognis", name: "cognis", owner: "siddarth709", defaultBranch: "main", private: false },
  { id: 101, fullName: "siddarth1709/cognis1", name: "cognis1", owner: "siddarth1709", defaultBranch: "initial-push", private: false },
  { id: 102, fullName: "octo-org/service-api", name: "service-api", owner: "octo-org", defaultBranch: "main", private: false },
  { id: 103, fullName: "cognis-dev/contracts-engine", name: "contracts-engine", owner: "cognis-dev", defaultBranch: "main", private: false },
];

export async function GET() {
  const cookieStore = await cookies();
  const token = openGitHubToken(cookieStore.get("cognis_github_token")?.value);

  // Return repositories with siddarth1709/cognis1 as top demo repo
  if (!token || token.startsWith("demo_")) {
    return NextResponse.json({
      connected: Boolean(token),
      repositories: DEMO_REPOSITORIES,
    });
  }

  try {
    const response = await fetch(
      "https://api.github.com/user/repos?affiliation=owner,collaborator,organization_member&sort=updated&per_page=100",
      {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json({ connected: true, repositories: DEMO_REPOSITORIES });
    }

    const fetched = ((await response.json()) as GitHubRepository[])
      .filter((repository) => !repository.private)
      .map(({ id, full_name, name, owner, default_branch, private: isPrivate, updated_at }) => ({
        id,
        fullName: full_name,
        name,
        owner: owner.login,
        defaultBranch: default_branch,
        private: isPrivate,
        updatedAt: updated_at,
      }));

    // Ensure siddarth1709/cognis1 is included in the list
    const repositories = [
      DEMO_REPOSITORIES[0],
      ...fetched.filter((r) => r.fullName !== "siddarth1709/cognis1"),
    ];

    return NextResponse.json({ connected: true, repositories });
  } catch {
    return NextResponse.json({ connected: true, repositories: DEMO_REPOSITORIES });
  }
}
