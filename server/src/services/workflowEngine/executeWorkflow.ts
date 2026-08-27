import prisma from "../../lib/prisma";
import { io } from "../../lib/socket";
import { decrypt } from "../../utils/crypto";
import { CanvasData, WorkflowContext } from "../../types/workflow";
import { nodeHandlers } from "./nodeHandlers";

function getNextNode(currentNode: any, nodes: any[], edges: any[], context: WorkflowContext) {
  const outgoingEdges = edges.filter((edge) => edge.source === currentNode.id);
  if (outgoingEdges.length === 0) return null;
  if (currentNode.type === "diffQualityConditional") {
    const matchedEdge = outgoingEdges.find((edge) => edge.sourceHandle === context.branchResult);
    if (!matchedEdge) return null;
    return nodes.find((node) => node.id === matchedEdge.target);
  }
  return nodes.find((node) => node.id === outgoingEdges[0].target);
}

export async function executeWorkflow(job: any) {
  const prNumber = job.data.payload.pull_request.number;
  const [owner, repoName] = job.data.repo.split("/");
  const workflow = await prisma.workflow.findUnique({ where: { id: job.data.workflowId }, include: { user: true } });
  if (!workflow) return;
  const context: WorkflowContext = { owner, repoName, prNumber, accessToken: decrypt(workflow.user.githubAccessToken) };
  const { nodes, edges } = workflow.canvasData as unknown as CanvasData;
  let currentNode = nodes.find((node) => node.type === "githubTrigger");
  let workflowRun = await prisma.workflowRun.create({ data: { workflowId: workflow.id, status: "running" } });

  while (currentNode) {
    const nextNode = getNextNode(currentNode, nodes, edges, context);
    if (!nextNode) break;
    const handler = nodeHandlers[nextNode.type as keyof typeof nodeHandlers];
    if (!handler) break;
    let nodeRun = await prisma.nodeRun.create({ data: { workflowRunId: workflowRun.id, nodeId: nextNode.id, status: "started" } });
    io.to(`workflow:${workflow.id}`).emit("workflow-progress", { workflowId: job.data.workflowId, nodeId: nextNode.id, status: "started" });
    try {
      Object.assign(context, await handler(context, nextNode));
      nodeRun = await prisma.nodeRun.update({ where: { id: nodeRun.id }, data: nextNode.type === "aiReview" ? { status: "completed", reviewText: context.reviewText } : { status: "completed" } });
      io.to(`workflow:${workflow.id}`).emit("workflow-progress", { workflowId: job.data.workflowId, nodeId: nextNode.id, status: "completed" });
    } catch (error) {
      console.log(error);
      io.to(`workflow:${workflow.id}`).emit("workflow-progress", { workflowId: job.data.workflowId, nodeId: nextNode.id, status: "failed" });
      await prisma.nodeRun.update({ where: { id: nodeRun.id }, data: { status: "failed" } });
      workflowRun = await prisma.workflowRun.update({ where: { id: workflowRun.id }, data: { status: "failed", completedAt: new Date() } });
      break;
    }
    currentNode = nextNode;
  }
  if (workflowRun.status === "running") await prisma.workflowRun.update({ where: { id: workflowRun.id }, data: { status: "completed", completedAt: new Date() } });
}
