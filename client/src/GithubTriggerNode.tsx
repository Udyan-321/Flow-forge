import {Handle , Position , useReactFlow} from "@xyflow/react"

function GithubTriggerNode({id ,data} : {id : string ; data :{ label :string ; repo?: string ; availableRepos?:string[] ; runStatus?:string}})
{
    const {updateNodeData , deleteElements} = useReactFlow();
    const borderColor = data.runStatus === "started" ? "orange"
  : data.runStatus === "completed" ? "green"
  : data.runStatus === "failed" ? "red"
  : "#6f42c1"; 
  
return(
    <div style={{
        padding : "10px 15px",
        borderRadius : "8px",
        border : `2px solid #fff`,
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
<select value={data.repo || ""} onChange={(e)=>{
 updateNodeData(id, { repo: e.target.value });
}} style={{ background: "#fff", color: "#000" }}>
<option disabled value="">Select a repository</option>
{data.availableRepos?.map((reponame)=>(
    <option value={reponame} key={reponame}>{reponame}</option>
))}
</select>
<Handle type="source" position={Position.Right}/>   


    </div>
)



}
export default GithubTriggerNode;