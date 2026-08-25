import { useState  } from "react";
import "@xyflow/react/dist/style.css";
import { useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
   <div style={{width : "100vw" , height : "100vw"}}>
    <div style={{ position: "absolute", zIndex: 10, padding: "10px" }}>{message}</div>
<h2>Your Workflows</h2>
        {workflows.map ((flow)=>(
            <div
                key = {flow.id}
                onClick = { ()=> navigate(`/workflow/${flow.id}`)}
                style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "8px", cursor: "pointer" }}>
            <div>Name : {flow.name}</div>
            <div>Created : {flow.createdAt}</div>
            <div>Updated : {flow.updatedAt}</div>
        
            
   </div>
  
        ))}
        <button onClick={()=>navigate(`/workflow/new`)}>Create</button>
   </div>
  )

}
export default App ;