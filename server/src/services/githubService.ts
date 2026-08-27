export async function createGithubWebhook(owner: string, repoName: string, accessToken: string): Promise<number> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/hooks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "web",
      active: true,
      events: ["pull_request"],
      config: {
        url: `${process.env.SERVER_URL}/webhook/github`,
        content_type: "json",
        secret: process.env.GITHUB_WEBHOOK_SECRET,
      },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`GitHub webhook creation failed: ${JSON.stringify(data)}`);
  }
  return data.id;
}

export async function deleteGithubWebhook(owner: string, repoName: string, hookId: number, accessToken: string) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repoName}/hooks/${hookId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    }
  );

  if (!response.ok && response.status !== 404) {
    const errorBody = await response.text();
    throw new Error(`Failed to delete webhook: ${errorBody}`);
  }
}

export async function fetchUserRepositories(accessToken: string) {
  const response = await fetch("https://api.github.com/user/repos", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error("Your token has expired");
  }
  const repositories = await response.json();
  return repositories.map((repository: any) => repository.full_name);
}

export async function exchangeGithubCode(code: string) {
  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });
  const tokenData = await tokenResponse.json();
  if (tokenData.error) {
    throw Object.assign(new Error("GitHub token exchange failed"), { tokenData });
  }
  return tokenData.access_token as string;
}

export async function fetchGithubUser(accessToken: string) {
  const response = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.json();
}
