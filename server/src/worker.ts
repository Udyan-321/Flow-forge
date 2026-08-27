import { Worker } from "bullmq";
import groq from "./groqClient";
import socket from "./socket";
const {io} = socket;
import prisma from "./prismaclient";
import { decrypt } from "./utils/crypto";



interface WorkflowContext {
  owner : string;
  repoName : string;
  prNumber : number;
  accessToken : string;
  diff?: string;
  reviewText?: string;
  severity?: "HIGH" | "LOW";
  branchResult?: "yes" | "no"
}

function getNextNode(currentNode:any , nodes: any[] , edges: any[] , context: WorkflowContext)
{
 const outgoingEdges = edges.filter((e)=>e.source === currentNode.id)
 if(outgoingEdges.length === 0)
  return null;

 if(currentNode.type === "diffQualityConditional")
 {
  const matchedEdge = outgoingEdges.find((e)=> e.sourceHandle === context.branchResult)
  if(!matchedEdge)
    return null;
  return nodes.find((n)=> n.id === matchedEdge.target)
 }
 return nodes.find((n)=> n.id === outgoingEdges[0].target)
}




async function handleAiReview( context : WorkflowContext , node : any)
{
  
const filesResponse = await fetch(
  `https://api.github.com/repos/${context.owner}/${context.repoName}/pulls/${context.prNumber}/files`,
  {
    headers: { Authorization: `Bearer ${context.accessToken}` }
  }
);
const files = await filesResponse.json();

const combinedDiff = files.map(file => `File: ${file.filename}\n${file.patch}`).join("\n\n")

const response = await groq.chat.completions.create({
  model : "openai/gpt-oss-120b",
  messages:[{
  role:"user",
  content: `Review this code diff. Your response MUST start with exactly one line: "SEVERITY: HIGH" or "SEVERITY: LOW", depending on whether the changes contain critical issues (security flaws, bugs that break functionality, major logic errors) versus minor/stylistic concerns. Then on new lines, give short, structured feedback:\n\n${combinedDiff}`,
 } ],
});
const content = response.choices[0].message.content
if(!content)
  throw new Error("Groq returned no review content");

const severity = content.trim().toUpperCase().startsWith("SEVERITY: HIGH") ? "HIGH" : "LOW"
return {...context , reviewText : content ,severity}
  
}

async function handleDiffQualityConditional(context : WorkflowContext , node:any)
{
  if (!context.severity) throw new Error("No severity available — branch node requires an AI Review node earlier in the workflow");
  const branchResult = context.severity === "HIGH" ? "yes" : "no";
  return {...context , branchResult};
}


async function handlePostComment(context : WorkflowContext , node:any)
{
  if (!context.reviewText) throw new Error("No review text to post")
  const commentResponse = await fetch(
  `https://api.github.com/repos/${context.owner}/${context.repoName}/issues/${context.prNumber}/comments`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${context.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ body: context.reviewText }),
  }
);
const commentData = await commentResponse.json();
if (!commentResponse.ok) {
  throw new Error(`GitHub comment failed: ${JSON.stringify(commentData)}`);
}
  return context;
 }

async function handleSlackNotification(context: WorkflowContext, node: any): Promise<WorkflowContext> {
  const slackUrl = node.data.slackUrl;

  if (!slackUrl) {
    throw new Error("Slack node has no webhook URL configured");
  }

  const message = context.reviewText
    ? `*PR Review for ${context.owner}/${context.repoName} #${context.prNumber}*\n${context.reviewText}`
    : `PR #${context.prNumber} on ${context.owner}/${context.repoName} was processed.`;

  const response = await fetch(slackUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: message }),
  });

  if (!response.ok) {
    throw new Error(`Slack webhook failed with status ${response.status}`);
  }

  return context;
}


 const nodeHandlers = {
  aiReview : handleAiReview,
  postComment : handlePostComment,
  slackNotif : handleSlackNotification,
  diffQualityConditional : handleDiffQualityConditional
};



const webhookWorker = new Worker("webhook-events" , 
  async  (job )=>{
                const prNumber = job.data.payload.pull_request.number;
const [owner, repoName] = job.data.repo.split("/");
const workflow = await prisma.workflow.findUnique({
    where : {id: job.data.workflowId},
    include : {user:true}
});
if(!workflow)
  return ;
const accessToken = decrypt(workflow?.user.githubAccessToken);
const workflowId = workflow.id;
const {nodes , edges} = workflow?.canvasData as {nodes: any[] , edges : any[]};
let context : WorkflowContext = {owner , repoName , prNumber , accessToken};
let currentNode = nodes.find((n) => n.type === "githubTrigger");

let workflowrun = await prisma.workflowRun.create({
  data:{
    workflowId : workflow.id,
    status:"running"
  }
});


while(currentNode){
  const nextNode = getNextNode(currentNode , nodes , edges , context);
  if(!nextNode)
    break;

  const handler = nodeHandlers[nextNode.type as keyof typeof nodeHandlers];
  if(!handler)
    break;
  let noderun = await prisma.nodeRun.create({
    data:{
      workflowRunId : workflowrun.id,
      nodeId : nextNode.id,
      status : "started"
    }
  })
   io.to(`workflow:${workflowId}`).emit('workflow-progress',
    {
      workflowId : job.data.workflowId,
      nodeId : nextNode.id,
      status : "started"
    } );
   try{
context = await handler(context , nextNode);
    if(nextNode.type === "aiReview")
    {
      noderun = await prisma.nodeRun.update({
      where :{ id : noderun.id} ,
      data:{ status: "completed" ,
        reviewText : context.reviewText
      }
    });
    }
    else
    {
      noderun = await prisma.nodeRun.update({
      where :{ id : noderun.id} ,
      data:{ status: "completed" ,
      }
    });
    }
    
    io.to(`workflow:${workflowId}`).emit('workflow-progress',
    {
      workflowId : job.data.workflowId,
      nodeId : nextNode.id,
      status : "completed",
    } );

   }
   catch(err){
    console.log(err)
   io.to(`workflow:${workflowId}`).emit('workflow-progress',
    {
      workflowId : job.data.workflowId,
      nodeId : nextNode.id,
      status : "failed"
    } );
    noderun = await prisma.nodeRun.update({
      where :{ id : noderun.id} ,
      data:{ status: "failed" ,
      }
    });
    workflowrun = await prisma.workflowRun.update({
  where : { id: workflowrun.id},
  data:{
    status:"failed",
    completedAt : new Date()
  }
});
break;
   }
   currentNode = nextNode;
}
if(workflowrun.status === "running")
workflowrun = await prisma.workflowRun.update({
  where : { id: workflowrun.id},
  data:{
    status:"completed",
    completedAt : new Date()
  }
});

  }
,
    {
    connection : {
        host : "localhost",
        port : 6379
    }
}
);