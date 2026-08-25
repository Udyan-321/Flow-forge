import {Handle , Position , useReactFlow} from "@xyflow/react"

function SlackNotifNode({id ,data} : {id : string ; data :{ label :string ; slackUrl?:string ; runStatus?:string}})
{
    const {updateNodeData , deleteElements} = useReactFlow();

    const borderColor = data.runStatus === "started" ? "orange"
  : data.runStatus === "completed" ? "green"
  : data.runStatus === "failed" ? "red"
  : "#2c2a8a"; 
return(
    <div style={{
        padding : "10px 15px",
        borderRadius : "8px",
        border : "2px solid #fff",
        background : `${borderColor}`,
        fontSize: "14px"
    }}>

<button
        onClick={() => deleteElements({ nodes: [{ id }] })}
        style={{
          position: "absolute",
          top: "-10px",
          right: "-10px"
        }}
      >
        ×
      </button>
      
<Handle type="target" position={Position.Left}/>   
<strong>{data.label}</strong>
<input type="text" name="slackUrl" id="" value={data.slackUrl || ""} onChange={(e)=>(
    updateNodeData(id , {slackUrl : e.target.value})
)}></input>
<Handle type="source" position={Position.Right}/>   

    </div>
)



}
export default SlackNotifNode;