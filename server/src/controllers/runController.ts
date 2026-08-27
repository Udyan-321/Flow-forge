import { Response } from "express";
import { AuthRequest } from "../types/auth";
import { getWorkflowRun, getWorkflowRuns } from "../services/runService";

export async function list(req: AuthRequest, res: Response) {
  try { const runs = await getWorkflowRuns(req.params.workflowId as string, req.userId); if (!runs) return res.status(404).send("Workflow not found or not authorised"); res.json(runs); }
  catch (error) { console.error(error); res.status(500).json({ error: "Something went wrong" }); }
}

export async function get(req: AuthRequest, res: Response) {
  try {
    const run = await getWorkflowRun(req.params.workflowRunId as string);
    if (!run) return res.status(404).json({ error: "Run not found" });
    if (run.workflow.userId != req.userId) return res.status(403).json({ error: "Not authorised" });
    res.json(run);
  } catch (error) { console.error(error); res.status(500).json({ error: "Something went wrong" }); }
}
