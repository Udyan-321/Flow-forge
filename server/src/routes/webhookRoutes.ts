import { Router } from "express";
import verifyGithubSignature from "../middleware/githubsig";
import { github } from "../controllers/webhookController";
const router = Router();
router.post("/github", verifyGithubSignature, github);
export default router;
