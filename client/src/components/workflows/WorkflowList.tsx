import { useNavigate } from "react-router-dom";
import type { WorkflowRecord } from "../../types/workflow";

export default function WorkflowList({ workflows, onDelete }: { workflows: WorkflowRecord[]; onDelete: (id: string) => void }) {
  const navigate = useNavigate();
  return <div className="list">{workflows.map((flow) => <div key={flow.id} className="list-row" onClick={() => navigate(`/workflow/${flow.id}`)}><button className="workflow__delete" onClick={(event) => { event.stopPropagation(); onDelete(flow.id); }} aria-label="Delete node">×</button><div className="list-row__main"><div className="list-row__title">{flow.name}</div><div className="list-row__meta"><span>created {flow.createdAt}</span><span>updated {flow.updatedAt}</span></div></div><span className="list-row__chevron">›</span></div>)}</div>;
}
