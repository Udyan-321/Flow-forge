import { useState , useEffect } from "react";
import { useNavigate , useParams } from "react-router-dom";
import axios from "axios";
import "./components.css";

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
    <div className="page"><div className="page__body"><div className="empty-state">Invalid workflow run id</div></div></div>
)

    if(!workflowrun)
        return( 
    <div className="page"><div className="page__body"><div className="empty-state">Loading…</div></div></div>
)

if(workflowrun.noderuns.length === 0)
        return( 
    <div className="page"><div className="page__body"><div className="empty-state">No node runs currently</div></div></div>
)




return (
<div className="page">
  <div className="page__body">
    <div className="page-header">
      <div>
        <h2 className="page-title">
          <span className={`badge badge--${workflowrun.status === "completed" ? "ok" : workflowrun.status === "failed" ? "err" : workflowrun.status === "started" ? "warn" : "idle"}`}>{workflowrun.status}</span>
        </h2>
        <p className="page-subtitle">started {workflowrun.startedAt} · completed {workflowrun.completedAt || "—"}</p>
      </div>
    </div>
    <div className="list">
    {workflowrun.noderuns.map((run)=>(
        <div key={run.id} className="list-row list-row--static">
          <div className="list-row__main">
            <div className="list-row__title">{run.nodeId}</div>
            <div className="list-row__meta">
              <span className={`badge badge--${run.status === "completed" ? "ok" : run.status === "failed" ? "err" : run.status === "started" ? "warn" : "idle"}`}>{run.status}</span>
            </div>
            {run.reviewText && <p className="list-row__review">{run.reviewText}</p>}
          </div>
        </div>
    ))}
    </div>
  </div>
</div>
)
}
export default RunsDetailList;
