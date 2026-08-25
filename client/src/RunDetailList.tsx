import { useState , useEffect } from "react";
import { useNavigate , useParams } from "react-router-dom";
import axios from "axios";

function RunsDetailList(){

const navigate = useNavigate();
    const {workflowRunId }= useParams();
    const [workflowrun , setworkflowrun] = useState(null);


    useEffect(()=>{
        const fetchworkflowrun = async ()=>{
            try{
            if(workflowRunId)
            {
const workflowRun = await axios.get(`http://localhost:5000/runs/${workflowRunId}`);
            setworkflowrun(workflowRun.data)
            }
            
        }
    catch(err)
    {
        console.log(err);
        navigate("/")
    }
}
        fetchworkflowrun();

 } , []);


 
    if(!workflowRunId)
        return( 
    <div>Invalid workflowrun id</div>
)

    if(!workflowrun)
        return( 
    <div>Loading...</div>
)

if(workflowrun.noderuns.length === 0)
        return( 
    <div>No noderuns currently</div>
)




return (
<div>
<h2>{workflowrun.status}</h2>
<h2>{workflowrun.startedAt}</h2>
<h2>{workflowrun.completedAt}</h2>
{workflowrun.noderuns.map((run)=>(
    <div key={run.id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "8px",  }} >
        <div>Id : {run.nodeId} </div>
        <div>Status : {run.status}</div>
        <div>Review : {run.reviewText}</div>

    </div>
))}



</div>
)
}
export default RunsDetailList;