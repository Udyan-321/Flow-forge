export interface WorkflowRun {
  id: string;
  status: string;
  startedAt: string;
  completedAt?: string;
}

export interface WorkflowRunDetail extends WorkflowRun {
  noderuns: Array<{ id: string; nodeId: string; status: string; reviewText?: string }>;
}
