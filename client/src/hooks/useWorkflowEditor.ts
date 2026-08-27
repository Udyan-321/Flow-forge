import { useCallback, useEffect, useState } from "react";
import { addEdge, useEdgesState, useNodesState, type Connection, type Edge, type Node } from "@xyflow/react";
import { createWorkflow, fetchRepositories, fetchWorkflow, updateWorkflow } from "../services/api";
import { useWorkflowSocket, type WorkflowProgress } from "./useWorkflowSocket";

export function useWorkflowEditor(workflowId: string | undefined) {
  const isCreate = workflowId === "new";
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [availableRepos, setAvailableRepos] = useState<string[]>([]);
  const [workflowname, setWorkflowname] = useState("");
  const [message, setMessage] = useState("Waiting for trigger");
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, string>>({});
  const onProgress = useCallback((data: WorkflowProgress) => { if (data.workflowId === workflowId) { setMessage(JSON.stringify(data)); setNodeStatuses((current) => ({ ...current, [data.nodeId]: data.status })); } }, [workflowId]);
  useWorkflowSocket(workflowId, onProgress);
  useEffect(() => { const load = async () => { try { if (workflowId && !isCreate) { const flow = await fetchWorkflow(workflowId); setNodes(flow.data.canvasData.nodes); setEdges(flow.data.canvasData.edges); setWorkflowname(flow.data.name); } const repositories = await fetchRepositories(); setNodes((current) => current.map((node) => node.type === "githubTrigger" ? { ...node, data: { ...node.data, availableRepos: repositories.data } } : node)); setAvailableRepos(repositories.data); } catch (error) { console.log(error); setMessage("Something went wrong"); } }; load(); }, [workflowId, isCreate, setNodes, setEdges]);
  const onConnect = useCallback((connection: Connection) => setEdges((current) => addEdge(connection, current)), [setEdges]);
  const addNode = (nodeType: string) => setNodes((current) => [...current, { id: crypto.randomUUID(), type: nodeType, position: { x: 100, y: 100 + current.length * 100 }, data: { label: nodeType, ...(nodeType === "githubTrigger" ? { availableRepos } : {}) } }]);
  const onSave = async () => { try { const githubnode = nodes.find((node) => node.type === "githubTrigger"); const repository = githubnode?.data?.repo; const cleanNodes = nodes.map((node) => { if (node.type !== "githubTrigger") return node; const cleanData = { ...node.data }; delete cleanData.availableRepos; return { ...node, data: cleanData }; }); const data = { canvasData: { nodes: cleanNodes, edges }, repository, name: workflowname || "Untitled" }; if (workflowId && !isCreate) await updateWorkflow(workflowId, data); else await createWorkflow(data); return true; } catch (error) { console.log(error); setMessage("Save failed"); return false; } };
  return { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, onSave, workflowname, setWorkflowname, message, nodeStatuses, isCreate };
}
