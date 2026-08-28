import { Request, Response } from "express";
import { authenticateWithGithub } from "../services/authService";

export function redirectToGithub(_req: Request, res: Response) {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_CALLBACK_URL}&scope=user:email,public_repo`;
  res.redirect(githubAuthUrl);
}

export async function githubCallback(req: Request, res: Response) {
  const code = req.query.code as string;
  if (!code) return res.status(400).send("Missing code from GitHub");
  try {
    const token = await authenticateWithGithub(code);
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  
  } catch (error: any) {
    console.error(error);
    if (error.tokenData) return res.status(400).json(error.tokenData);
    res.status(500).json({ error: "OAuth callback failed" });
  }
}
