import prisma from "../lib/prisma";

export async function getWorkflowRuns(workflowId: string, userId?: string) {
  const workflow = await prisma.workflow.findFirst({ where: { id: workflowId, userId } });
  if (!workflow) return null;
  return prisma.workflowRun.findMany({
    where: { workflowId, workflow: { userId } },
    orderBy: { startedAt: "desc" },
  });
}

export function getWorkflowRun(id: string) {
  return prisma.workflowRun.findUnique({ where: { id }, include: { workflow: true, noderuns: true } });
}
