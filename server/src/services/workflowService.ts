import prisma from "../lib/prisma";
import { decrypt } from "../utils/crypto";
import { createGithubWebhook, deleteGithubWebhook } from "./githubService";

export async function clearUnwatchedWebhooks(repositoryName: string, userId: string) {
  const watchcount = await prisma.workflow.count({ where: { repository: repositoryName } });
  if (watchcount !== 1) return;

  const [owner, repoName] = repositoryName.split("/");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.githubAccessToken) return;

  const token = decrypt(user.githubAccessToken);
  const repositoryWebhook = await prisma.repowebhook.findUnique({ where: { repository: repositoryName } });
  await deleteGithubWebhook(owner, repoName, repositoryWebhook?.githubHookId as number, token);
  await prisma.repowebhook.delete({ where: { repository: repositoryName } });
}

export async function createWorkflow(data: { canvasData: any; name: string; repository?: string; userId: string }) {
  const newflow = await prisma.workflow.create({
    data: { canvasData: data.canvasData, name: data.name, repository: data.repository, userId: data.userId },
    include: { user: true },
  });
  const webhook = await prisma.repowebhook.findUnique({ where: { repository: data.repository } });
  if (!webhook) {
    if (!newflow.repository) return newflow;
    const [owner, repoName] = newflow.repository.split("/");
    const hookId = await createGithubWebhook(owner, repoName, decrypt(newflow.user.githubAccessToken));
    await prisma.repowebhook.create({ data: { repository: newflow.repository, githubHookId: hookId, userId: newflow.userId } });
  }
  return newflow;
}

export async function updateWorkflow(id: string, data: { canvasData: any; repository?: string; name: string; userId: string }) {
  const flow = await prisma.workflow.findUnique({ where: { id, userId: data.userId } });
  if (!flow) return null;
  if (flow.repository && flow.repository != data.repository) await clearUnwatchedWebhooks(flow.repository, data.userId);
  const updated = await prisma.workflow.updateMany({ where: { id, userId: data.userId }, data: { canvasData: data.canvasData, repository: data.repository, name: data.name } });
  const fetchflow = await prisma.workflow.findUnique({ where: { id, userId: data.userId }, include: { user: true } });
  if (!fetchflow) return { updated, fetchflow };
  const webhook = await prisma.repowebhook.findUnique({ where: { repository: data.repository } });
  if (!webhook) {
    if (!fetchflow.repository) return { updated, fetchflow };
    const [owner, repoName] = fetchflow.repository.split("/");
    const hookId = await createGithubWebhook(owner, repoName, decrypt(fetchflow.user.githubAccessToken));
    await prisma.repowebhook.create({ data: { repository: fetchflow.repository, githubHookId: hookId, userId: fetchflow.userId } });
  }
  return { updated, fetchflow };
}

export default prisma;
