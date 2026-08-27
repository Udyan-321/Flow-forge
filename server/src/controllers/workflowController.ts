import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../types/auth";
import { decrypt } from "../utils/crypto";
import { createWorkflow, updateWorkflow, clearUnwatchedWebhooks } from "../services/workflowService";
import { fetchUserRepositories } from "../services/githubService";

export async function listRepositories(req: AuthRequest, res: Response) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).send("User does not exist");
    if (!user.githubAccessToken) return res.status(400).send("User token doesnt exist");
    res.json(await fetchUserRepositories(decrypt(user.githubAccessToken)));
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
}

export async function create(req: AuthRequest, res: Response) {
  try { res.json(await createWorkflow({ ...req.body, userId: req.userId! as string })); }
  catch (error) { console.error(error); res.status(500).json({ error: "Something went wrong" }); }
}

export async function list(req: AuthRequest, res: Response) {
  try { res.json(await prisma.workflow.findMany({ where: { userId: req.userId } })); }
  catch (_error) { res.status(500).json({ error: "Something went wrong" }); }
}

export async function get(req: AuthRequest, res: Response) {
  try {
    const workflow = await prisma.workflow.findUnique({ where: { id: req.params.id as string } });
    if (!workflow) return res.status(404).json({ error: "Row doesn't exist" });
    if (req.userId === workflow.userId) return res.json(workflow);
    res.status(403).json({ error: "You are forbidden to access this workflow" });
  } catch (error) { console.error(error); res.status(500).json({ error: "Something went wrong" }); }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const result = await updateWorkflow(req.params.id as string, { ...req.body, userId: req.userId! as string });
    if (!result) return res.status(404).json({ error: "Workflow not found or not authorised" });
    if (result.updated.count === 0) return res.status(404).json({ error: "Workflow not found or not authorised" });
    res.json(result.updated);
  } catch (error) { console.error(error); res.status(500).json({ error: "Something went wrong" }); }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    if (!req.params.id) return res.json("Invalid workflow id");
    const flow = await prisma.workflow.findUnique({ where: { id: req.params.id as string, userId: req.userId } });
    if (!flow) return res.status(404).json({ error: "Workflow not found or not authorised" });
    if (flow.repository) await clearUnwatchedWebhooks(flow.repository, req.userId as string);
    const deleted = await prisma.workflow.deleteMany({ where: { id: req.params.id as string, userId: req.userId } });
    if (deleted.count === 0) return res.status(404).json("Workflow not found or not authorised");
    res.status(204).end();
  } catch (error) { console.log(error); res.status(500).json({ error: "Something went wrong" }); }
}
