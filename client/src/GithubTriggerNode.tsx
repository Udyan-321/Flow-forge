import {Handle , Position , useReactFlow} from "@xyflow/react"
import "./nodes.css"

function GithubTriggerNode({id ,data} : {id : string ; data :{ label :string ; repo?: string ; availableRepos?:string[] ; runStatus?:string}})
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
<select className="node__select" value={data.repo || ""} onChange={(e)=>{
 updateNodeData(id, { repo: e.target.value });
}}>
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
