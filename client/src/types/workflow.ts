import type { Edge, Node } from "@xyflow/react";

export interface WorkflowRecord {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowCanvasData {
  nodes: Node[];
  edges: Edge[];
}

export interface WorkflowRecordWithCanvas extends WorkflowRecord {
  canvasData: WorkflowCanvasData;
}
