import { useEffect, useState } from "react";
import { deleteWorkflow as removeWorkflow, fetchWorkflows } from "../services/api";
import type { WorkflowRecord } from "../types/workflow";

export function useWorkflows() {
  const [workflows, setWorkflows] = useState<WorkflowRecord[]>([]);
  const [message, setMessage] = useState("");
  useEffect(() => { fetchWorkflows().then((response) => setWorkflows(response.data)).catch((error) => { console.log(error); setMessage("Something went wrong"); }); }, []);
  const deleteWorkflow = async (id: string) => { try { await removeWorkflow(id); setWorkflows((current) => current.filter((workflow) => workflow.id !== id)); } catch (error) { console.log(error); setMessage("Something went wrong "); } };
  return { workflows, message, deleteWorkflow };
}
