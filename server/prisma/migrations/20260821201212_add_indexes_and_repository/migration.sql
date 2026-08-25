-- AlterTable
ALTER TABLE "Workflow" ADD COLUMN     "repository" TEXT;

-- CreateIndex
CREATE INDEX "NodeRun_workflowRunId_idx" ON "NodeRun"("workflowRunId");

-- CreateIndex
CREATE INDEX "Workflow_repository_idx" ON "Workflow"("repository");

-- CreateIndex
CREATE INDEX "WorkflowRun_workflowId_idx" ON "WorkflowRun"("workflowId");
