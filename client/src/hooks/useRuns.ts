import { useEffect, useState } from "react";
import { fetchWorkflowRuns } from "../services/api";
import type { WorkflowRun } from "../types/run";
export function useRuns(workflowId: string | undefined) { const [runs, setRuns] = useState<WorkflowRun[]>([]); useEffect(() => { if (workflowId) fetchWorkflowRuns(workflowId).then((response) => setRuns(response.data)).catch((error) => console.log(error)); }, [workflowId]); return runs; }
