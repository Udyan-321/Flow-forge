import axios from "axios";
import { useState , useEffect} from "react";
import { useParams , useNavigate } from "react-router-dom";

function RunList(){

const {workflowId} = useParams();

const [runs , setruns] = useState([]);
const navigate = useNavigate();


useEffect(()=>{
    const fetchruns = async ()=>{
        try{
            if(workflowId)
            {
                const workflowruns =await axios.get(`http://localhost:5000/workflow/${workflowId}/runs`);
        setruns(workflowruns.data);
            }
        
        }
        catch(err)
        {
            console.log(err);
            
        }
    }
    fetchruns();
} , []);

if(!workflowId || runs.length === 0)
return(
    <div>No past runs</div>
)

return (
    <div>
        <h2>Past Runs</h2>
        {runs.map ((run)=>(
            <div
                key = {run.id}
                onClick = { ()=> navigate(`/runs/${run.id}`)}
                style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "8px", cursor: "pointer" }}>
            <div>Status : {run.status}</div>
            <div>Started : {run.startedAt}</div>
            
            </div>
        ))}



    </div>
)

}
export default RunList;