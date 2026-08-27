async function deleteGithubWebhook(owner: string, repoName: string, hookId: number, accessToken: string) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repoName}/hooks/${hookId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json"
      }
    }
  );

  if (!response.ok && response.status !== 404) {
    const errorBody = await response.text();
    throw new Error(`Failed to delete webhook: ${errorBody}`);
  }
}
export default deleteGithubWebhook