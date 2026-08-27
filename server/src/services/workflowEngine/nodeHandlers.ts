import groq from "../../lib/groq";
import { WorkflowContext } from "../../types/workflow";

export async function handleAiReview(context: WorkflowContext, node: any) {
  const filesResponse = await fetch(`https://api.github.com/repos/${context.owner}/${context.repoName}/pulls/${context.prNumber}/files`, { headers: { Authorization: `Bearer ${context.accessToken}` } });
  const files = await filesResponse.json();
  const combinedDiff = files.map((file: any) => `File: ${file.filename}\n${file.patch}`).join("\n\n");
  const response = await groq.chat.completions.create({ model: "openai/gpt-oss-120b", messages: [{ role: "user", content: `Review this code diff. Your response MUST start with exactly one line: "SEVERITY: HIGH" or "SEVERITY: LOW", depending on whether the changes contain critical issues (security flaws, bugs that break functionality, major logic errors) versus minor/stylistic concerns. Then on new lines, give short, structured feedback:\n\n${combinedDiff}` }] });
  const content = response.choices[0].message.content;
  if (!content) throw new Error("Groq returned no review content");
  const severity = content.trim().toUpperCase().startsWith("SEVERITY: HIGH") ? "HIGH" : "LOW";
  return { ...context, reviewText: content, severity } as WorkflowContext;
}

export async function handleDiffQualityConditional(context: WorkflowContext, node: any) {
  if (!context.severity) throw new Error("No severity available — branch node requires an AI Review node earlier in the workflow");
  return { ...context, branchResult: context.severity === "HIGH" ? "yes" : "no" };
}

export async function handlePostComment(context: WorkflowContext, node: any) {
  if (!context.reviewText) throw new Error("No review text to post");
  const response = await fetch(`https://api.github.com/repos/${context.owner}/${context.repoName}/issues/${context.prNumber}/comments`, { method: "POST", headers: { Authorization: `Bearer ${context.accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ body: context.reviewText }) });
  const data = await response.json();
  if (!response.ok) throw new Error(`GitHub comment failed: ${JSON.stringify(data)}`);
  return context;
}

export async function handleSlackNotification(context: WorkflowContext, node: any): Promise<WorkflowContext> {
  const slackUrl = node.data.slackUrl;
  if (!slackUrl) throw new Error("Slack node has no webhook URL configured");
  const message = context.reviewText ? `*PR Review for ${context.owner}/${context.repoName} #${context.prNumber}*\n${context.reviewText}` : `PR #${context.prNumber} on ${context.owner}/${context.repoName} was processed.`;
  const response = await fetch(slackUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: message }) });
  if (!response.ok) throw new Error(`Slack webhook failed with status ${response.status}`);
  return context;
}

export const nodeHandlers = { aiReview: handleAiReview, postComment: handlePostComment, slackNotif: handleSlackNotification, diffQualityConditional: handleDiffQualityConditional };
