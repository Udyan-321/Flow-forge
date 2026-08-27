import { useNavigate, useParams } from "react-router-dom";
import { useWorkflowEditor } from "../hooks/useWorkflowEditor";
import CanvasToolbar from "../components/canvas/CanvasToolbar";
import WorkflowCanvas from "../components/canvas/WorkflowCanvas";
import "../styles/components.css";
export default function WorkflowEditorPage() { const navigate = useNavigate(); const { workflowId } = useParams(); const editor = useWorkflowEditor(workflowId); const save = async () => { if (await editor.onSave()) navigate("/"); }; return <div className="page canvas-page"><CanvasToolbar isCreate={editor.isCreate} workflowname={editor.workflowname} message={editor.message} onNameChange={editor.setWorkflowname} onAddNode={editor.addNode} onSave={save} onViewRuns={() => navigate(`/workflow/${workflowId}/runs`)} /><WorkflowCanvas nodes={editor.nodes} edges={editor.edges} statuses={editor.nodeStatuses} onConnect={editor.onConnect} onNodesChange={editor.onNodesChange} onEdgesChange={editor.onEdgesChange} /></div>; }
