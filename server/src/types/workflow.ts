export interface WorkflowContext {
  owner: string;
  repoName: string;
  prNumber: number;
  accessToken: string;
  diff?: string;
  reviewText?: string;
  severity?: "HIGH" | "LOW";
  branchResult?: "yes" | "no";
}

export interface CanvasData {
  nodes: any[];
  edges: any[];
}
