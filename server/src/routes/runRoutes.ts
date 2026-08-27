import { Router } from "express";
import requireAuth from "../middleware/auth";
import * as controller from "../controllers/runController";
const router = Router();
router.get("/workflow/:workflowId/runs", requireAuth, controller.list);
router.get("/runs/:workflowRunId", requireAuth, controller.get);
export default router;
