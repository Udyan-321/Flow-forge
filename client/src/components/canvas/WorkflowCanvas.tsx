import { Background, Controls, ReactFlow, type Connection, type Edge, type Node, type OnEdgesChange, type OnNodesChange } from "@xyflow/react";
import GithubTriggerNode from "../nodes/GithubTriggerNode";
import AiReviewNode from "../nodes/AiReviewNode";
import PostCommentNode from "../nodes/PostCommentNode";
import SlackNotifNode from "../nodes/SlackNotifNode";
import DiffQualityConditionalNode from "../nodes/DiffQualityConditionalNode";
import "@xyflow/react/dist/style.css";
import "../../styles/nodes.css";

const nodeTypes = { githubTrigger: GithubTriggerNode, aiReview: AiReviewNode, postComment: PostCommentNode, slackNotif: SlackNotifNode, diffQualityConditional: DiffQualityConditionalNode };
export default function WorkflowCanvas({ nodes, edges, statuses, onConnect, onNodesChange, onEdgesChange }: { nodes: Node[]; edges: Edge[]; statuses: Record<string, string>; onConnect: (connection: Connection) => void; onNodesChange: OnNodesChange; onEdgesChange: OnEdgesChange }) {
  return <div className="canvas-area"><ReactFlow nodes={nodes.map((node) => ({ ...node, data: { ...node.data, runStatus: statuses[node.id] } }))} edges={edges} onConnect={onConnect} onEdgesChange={onEdgesChange} onNodesChange={onNodesChange} nodeTypes={nodeTypes}><Background /><Controls /></ReactFlow></div>;
}
