import {Queue} from "bullmq";

const webhookQueue = new Queue("webhook-events" , {
  connection :{
    host : "localhost",
    port : 6379
  }
});

export default webhookQueue;