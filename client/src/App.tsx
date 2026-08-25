import { useState  } from "react";
import "@xyflow/react/dist/style.css";
import { useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./components.css";

function App(){
 console.log("APP RENDERING");
  const [message , setmessage] = useState("");
  const [workflows , setworkflows] = useState([]);
  const navigate = useNavigate();
  
useEffect(()=>{
const socket  = io("http://localhost:5000");

socket.on("connect" , ()=>{
  console.log("Connected to server" , socket.id)
})

socket.on("server-message" , (data)=>{
  setmessage(data);
});

return ()=>{
  socket.disconnect();
}
} ,[]);


useEffect(()=>{
  const fetchflows = async ()=>{
    try{
      const flowdata = await axios.get("http://localhost:5000/workflows");
    setworkflows(flowdata.data);
    }
    catch(err)
    {
      console.log(err);
      setmessage("Something went wrong")
    }
  }
  fetchflows();
}, [])





  return (
   <div className="page">
    {message && <div className="banner">{message}</div>}

    <div className="page__body">
      <div className="page-header">
        <div>
          <h2 className="page-title">Your workflows</h2>
          <p className="page-subtitle">{workflows.length} total</p>
        </div>
        <button className="btn btn--primary" onClick={()=>navigate(`/workflow/new`)}>+ New workflow</button>
      </div>

      {workflows.length === 0 && (
        <div className="empty-state">No workflows yet — create one to get started.</div>
      )}

      <div className="list">
        {workflows.map ((flow)=>(
            <div
                key = {flow.id}
                className="list-row"
                onClick = { ()=> navigate(`/workflow/${flow.id}`)}>
              <div className="list-row__main">
                <div className="list-row__title">{flow.name}</div>
                <div className="list-row__meta">
                  <span>created {flow.createdAt}</span>
                  <span>updated {flow.updatedAt}</span>
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
export default App ;
