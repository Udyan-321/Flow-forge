import axios from "axios";
import { useState , useEffect} from "react";
import { useParams , useNavigate } from "react-router-dom";
import "./components.css";

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
    <div className="page">
      <div className="page__body">
        <div className="empty-state">No past runs</div>
      </div>
    </div>
)

return (
    <div className="page">
      <div className="page__body">
        <div className="page-header">
          <h2 className="page-title">Past runs</h2>
        </div>
        <div className="list">
        {runs.map ((run)=>(
            <div
                key = {run.id}
                className="list-row"
                onClick = { ()=> navigate(`/runs/${run.id}`)}>
              <div className="list-row__main">
                <div className="list-row__title">
                  <span className={`badge badge--${run.status === "completed" ? "ok" : run.status === "failed" ? "err" : run.status === "started" ? "warn" : "idle"}`}>{run.status}</span>
                </div>
                <div className="list-row__meta">
                  <span>started {run.startedAt}</span>
                </div>
              </div>
              <span className="list-row__chevron">›</span>
            </div>
        ))}
        </div>
      </div>
    </div>
)

}
export default RunList;
