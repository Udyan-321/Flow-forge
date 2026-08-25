import {Handle , Position , useReactFlow} from "@xyflow/react"

function AiReviewNode({id ,data} : {id : string ; data :{ label :string ; repo?: string ;runStatus?:string}})
{
 const {deleteElements} = useReactFlow();

 const borderColor = data.runStatus === "started" ? "orange"
  : data.runStatus === "completed" ? "green"
  : data.runStatus === "failed" ? "red"
  : "#b8932641"; 
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
<Handle type="source" position={Position.Right}/>   

    </div>
)



}
export default AiReviewNode;