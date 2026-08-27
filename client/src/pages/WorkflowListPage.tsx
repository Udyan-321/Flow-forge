import { useNavigate } from "react-router-dom";
import { useWorkflows } from "../hooks/useWorkflows";
import WorkflowList from "../components/workflows/WorkflowList";
import "../styles/components.css";
export default function WorkflowListPage() { const navigate = useNavigate(); const { workflows, message, deleteWorkflow } = useWorkflows(); return <div className="page">{message && <div className="banner">{message}</div>}<div className="page__body"><div className="page-header"><div><h2 className="page-title">Your workflows</h2><p className="page-subtitle">{workflows.length} total</p></div><button className="btn btn--primary" onClick={() => navigate("/workflow/new")}>+ New workflow</button></div>{workflows.length === 0 && <div className="empty-state">No workflows yet — create one to get started.</div>}<WorkflowList workflows={workflows} onDelete={deleteWorkflow} /></div></div>; }
