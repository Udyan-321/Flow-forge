import { Response } from "express";
import { enqueueGithubPullRequest } from "../services/webhookService";

export async function github(req: any, res: Response) {
  try {
    const repository = await enqueueGithubPullRequest(req.body);
    if (!repository) return res.status(400).json({ error: "Missing repository info in payload" });
    res.status(200).send("ok");
  } catch (error) { res.status(500).json({ error: "Webhook processing failed" }); console.log(error); }
}
