import { Routes, Route } from "react-router-dom";
import AuthGate from "../components/auth/AuthGate";
import WorkflowListPage from "../pages/WorkflowListPage";
import WorkflowEditorPage from "../pages/WorkflowEditorPage";
import RunListPage from "../pages/RunListPage";
import RunDetailPage from "../pages/RunDetailPage";
export default function AppRoutes() { return <AuthGate><Routes><Route path="/" element={<WorkflowListPage />} /><Route path="/workflow/:workflowId/runs" element={<RunListPage />} /><Route path="/runs/:workflowRunId" element={<RunDetailPage />} /><Route path="/workflow/:workflowId" element={<WorkflowEditorPage />} /></Routes></AuthGate>; }
