import { Worker } from "bullmq";
import { executeWorkflow } from "../services/workflowEngine/executeWorkflow";

export const webhookWorker = new Worker("webhook-events", executeWorkflow, { connection: { host: "localhost", port: 6379 } });
