import {Handle , Position , useReactFlow} from "@xyflow/react"
import "./nodes.css"

function SlackNotifNode({id ,data} : {id : string ; data :{ label :string ; slackUrl?:string ; runStatus?:string}})
{
    const {updateNodeData , deleteElements} = useReactFlow();

return(
    <div className={`node node--${data.runStatus || "idle"}`}>

<button
        className="node__delete"
        onClick={() => deleteElements({ nodes: [{ id }] })}
        aria-label="Delete node"
      >
        ×
      </button>

<Handle type="target" position={Position.Left}/>
<div className="node__label">
  <span className="node__dot" />
  <strong>{data.label}</strong>
</div>
<input className="node__input" type="text" name="slackUrl" placeholder="Slack webhook URL" value={data.slackUrl || ""} onChange={(e)=>(
    updateNodeData(id , {slackUrl : e.target.value})
)}></input>
<Handle type="source" position={Position.Right}/>

    </div>
)



}
export default SlackNotifNode;
