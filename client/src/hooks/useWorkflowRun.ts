import { useEffect, useState } from "react";
import { fetchWorkflowRun } from "../services/api";
import type { WorkflowRunDetail } from "../types/run";
export function useWorkflowRun(id: string | undefined, onError: (error: unknown) => void) { const [run, setRun] = useState<WorkflowRunDetail | null>(null); useEffect(() => { if (id) fetchWorkflowRun(id).then((response) => setRun(response.data)).catch((error) => { console.log(error); onError(error); }); }, [id, onError]); return run; }
