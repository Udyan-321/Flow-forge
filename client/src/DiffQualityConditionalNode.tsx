import { Handle, Position , useReactFlow } from "@xyflow/react";
import "./nodes.css"

function DiffQualityConditionalNode({ id, data }: { id: string; data: { label: string; runStatus?: string } })
{
   const {deleteElements} = useReactFlow();
  return (
    <div className={`node node--${data.runStatus || "idle"}`}>
      <button
        className="node__delete"
        onClick={() => deleteElements({ nodes: [{ id }] })}
        aria-label="Delete node"
      >
        ×
      </button>
      <Handle type="target" position={Position.Left} />
      <div className="node__label">
        <span className="node__dot" />
        <strong>{data.label}</strong>
      </div>

      <Handle type="source" position={Position.Bottom} id="yes" className="node__handle-yes" style={{ left: "25%" }} />
      <div className="node__branch-label node__branch-label--yes">Yes</div>

      <Handle type="source" position={Position.Bottom} id="no" className="node__handle-no" style={{ left: "75%" }} />
      <div className="node__branch-label node__branch-label--no">No</div>
    </div>
  );
}
export default DiffQualityConditionalNode;
