import { Router } from "express";
import { redirectToGithub, githubCallback } from "../controllers/authController";
const router = Router();
router.get("/github", redirectToGithub);
router.get("/github/callback", githubCallback);
export default router;
