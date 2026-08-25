import { useState , useCallback } from "react";
import GithubTriggerNode from "./GithubTriggerNode";
import AiReviewNode from "./AiReviewNode";
import PostCommentNode from "./PostCommentNode";
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect } from "react";
import axios from "axios";
import { useNavigate , useParams } from "react-router-dom";
import { io } from "socket.io-client";
import SlackNotifNode from "./SlackNotifNode";
import DiffQualityConditionalNode from "./DiffQualityConditionalNode";
const nodeTypes = {githubTrigger : GithubTriggerNode , aiReview : AiReviewNode , postComment : PostCommentNode , slackNotif : SlackNotifNode , diffQualityConditional: DiffQualityConditionalNode };
const initialNodes : Node[] =[];

const initialEdges : Edge[] = [];


function Workflow()
{
const [message , setmessage] = useState("Waiting for trigger");
    const [nodes , setNodes , onNodesChange] = useNodesState(initialNodes)
      const [edges , setEdges , onEdgesChange] = useEdgesState(initialEdges);
     const [availableRepos, setAvailableRepos] = useState<string[]>([]);
     const [workflowname , setworkflowname] = useState("");
     const [nodeStatuses, setNodeStatuses] = useState<Record<string, string>>({});
      const navigate = useNavigate();
      const {workflowId} = useParams();
      const isCreate = workflowId === "new"
      const onconnect = useCallback((connection:Connection )=>{
        setEdges((eds) => addEdge(connection ,eds ))} , [setEdges]
      );


      useEffect(()=>{
const socket  = io("http://localhost:5000");


socket.on("workflow-progress", (data) => {
  if (data.workflowId === workflowId) {
    setmessage(JSON.stringify(data));
    setNodeStatuses((current) => ({ ...current, [data.nodeId]: data.status }));
  }
});

return ()=>{
  socket.disconnect();
}
} ,[workflowId]);



      const onSave = async ()=>{
 try{
  const githubnode = nodes.find(node=> node.type === "githubTrigger");
  const repository = githubnode?.data?.repo;
  const cleanNodes = nodes.map((node) => {
  if (node.type === "githubTrigger") {
    const { availableRepos, ...restOfData } = node.data;
    return { ...node, data: restOfData };
  }
  return node;
});
 if(workflowId  && !isCreate)
  {
  await axios.put(`http://localhost:5000/workflow/${workflowId}` , {
    canvasData : {nodes:cleanNodes , edges},
    repository,
    name : workflowname
 } );
}
else
{
  await axios.post(`http://localhost:5000/workflow/create` , {
    canvasData : {nodes:cleanNodes , edges}, 
    name : workflowname || "Untitled",
    repository
 } );
 
}
 navigate("/");
 
}
catch(err)
{
  console.log(err);
  setmessage("Save failed");
}};


const addNode = async (nodetype:string)=>{
  setNodes((currentnodes)=>{
    const newnode = {
      id:  crypto.randomUUID(),
      type : nodetype,
      position : {x:100 , y:100 + currentnodes.length*100},
      data :{
        label : nodetype,
        ...(nodetype === "githubTrigger" ? {availableRepos}:{})
      }

    }
   const newnodes = [...currentnodes, newnode]
return newnodes
}
)
  }





useEffect( ()=>{
  
    const loadWorkflow =  async ()=>{
      try{
        if(workflowId && !isCreate)
        {
const flow = await axios.get(`http://localhost:5000/workflow/${workflowId}`)
                setNodes(flow.data.canvasData.nodes);
                setEdges(flow.data.canvasData.edges);
            setworkflowname(flow.data.name)
                }

const reponames = await axios.get("http://localhost:5000/user/repos" );
 setNodes((currentnodes)=>{
 return  currentnodes.map((node)=>{
    if(node.type === "githubTrigger")
    {
      return{
        ...node,
    data:{
      ...node.data,
      availableRepos : reponames.data
    }
      }
    
 }
 return node;
});
 });
 setAvailableRepos(reponames.data);
}
catch(err){
    console.log(err);
    setmessage("Something went wrong")
  }
}
loadWorkflow();

 
}, [workflowId , isCreate]);


      return (
         <div style={{width : "100vw" , height : "100vw"}}>
          <div style={{display: "flex", alignItems: "center", gap: "40px", justifyContent: "center"}} >
           
            {
          !isCreate && (<button onClick={()=> navigate(`/workflow/${workflowId}/runs`)}>View Past Runs</button>)   
}
           
          <input type="text" name="" placeholder="Enter workflow name" value={workflowname} onChange={(e)=>(setworkflowname(e.target.value))} id="" />
          <button onClick={onSave}>Save</button>
</div>
<br />
          <div style={{  padding: "10px" }}>{message}</div>
          <select name="Add Nodes" value={""} id="" style={{marginLeft: "10px"}} 
          onChange={(e)=>(addNode(e.target.value))}>
            <option disabled value="">Add node</option>
            <option value="githubTrigger" >githubTrigger</option>
            <option value="aiReview" >aiReview</option>
            <option value="diffQualityConditional" >diffQualityConditional</option>
            <option value="postComment" >postComment</option>
            <option value="slackNotif" >slackNotif</option>
            
          </select>
          
         <br />
         
      <ReactFlow
      nodes={nodes.map((node) => ({
    ...node,
    data: { ...node.data, runStatus: nodeStatuses[node.id] }
  }))}
      edges = {edges}
      onConnect = {onconnect}
      onEdgesChange = {onEdgesChange}
      onNodesChange = {onNodesChange}
      nodeTypes={nodeTypes}
      >
      <Background/>
      <Controls/>
      </ReactFlow>
         </div>
        )
      
}
export default Workflow