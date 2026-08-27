import { Queue } from "bullmq";
import connection from "./redisConnection"; 
const webhookQueue = new Queue("webhook-events", {
  connection
});

export default webhookQueue;