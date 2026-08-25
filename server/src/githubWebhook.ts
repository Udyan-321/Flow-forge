async function createGithubWebhook(owner: string, repoName: string, accessToken: string): Promise<number> {
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
export default createGithubWebhook;