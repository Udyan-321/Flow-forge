import { useEffect } from "react";
import { createSocket } from "../services/socket";

export interface WorkflowProgress {
  workflowId: string;
  nodeId: string;
  status: string;
}

export function useWorkflowSocket(workflowId: string | undefined, onProgress: (data: WorkflowProgress) => void) {
  useEffect(() => {
    const socket = createSocket();
    socket.on("connect", () => { console.log("Socket connected:", socket.id); if (workflowId && workflowId !== "new") socket.emit("join-workflow", workflowId); });
    socket.on("workflow-progress", onProgress);
    socket.on("error", (message) => console.log("Socket error:", message));
    socket.on("connect_error", (error) => console.log("Socket authentication failed:", error.message));
    return () => { socket.disconnect(); };
  }, [workflowId, onProgress]);
}
