import prisma from "../lib/prisma";
import webhookQueue from "../lib/queue";

export async function enqueueGithubPullRequest(payload: any) {
  const repository = payload?.repository?.full_name;
  if (!repository) return null;
  const workflows = await prisma.workflow.findMany({ where: { repository } });
  for (const workflow of workflows) {
    await webhookQueue.add("pr-event", { workflowId: workflow.id, repo: repository, payload });
  }
  return repository;
}
