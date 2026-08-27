import { Worker } from "bullmq";
import { executeWorkflow } from "../services/workflowEngine/executeWorkflow";
import connection from "../lib/redisConnection";
export const webhookWorker = new Worker("webhook-events", executeWorkflow, {
    connection });
