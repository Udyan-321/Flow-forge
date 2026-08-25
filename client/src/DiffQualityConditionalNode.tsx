import { Handle, Position } from "@xyflow/react";

function DiffQualityConditionalNode({ id, data }: { id: string; data: { label: string; runStatus?: string } })
{
  const borderColor = data.runStatus === "started" ? "orange"
    : data.runStatus === "completed" ? "green"
    : data.runStatus === "failed" ? "red"
    : "#686927";

  return (
    <div style={{
      padding: "10px 15px",
      borderRadius: "8px",
      border: `2px solid #ffffff`,
      background: `${borderColor}`,
      fontSize: "14px"
    }}>
      <Handle type="target" position={Position.Left} />
      <strong>{data.label}</strong>

      <Handle type="source" position={Position.Bottom} id="yes" style={{ left: "25%", background: "green" }} />
      <div style={{ fontSize: "10px", position: "absolute", bottom: "-18px", left: "10%" }}>Yes</div>

      <Handle type="source" position={Position.Bottom} id="no" style={{ left: "75%", background: "red" }} />
      <div style={{ fontSize: "10px", position: "absolute", bottom: "-18px", left: "65%" }}>No</div>
    </div>
  );
}
export default DiffQualityConditionalNode;