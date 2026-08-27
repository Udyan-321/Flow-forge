import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { encrypt } from "../utils/crypto";
import { exchangeGithubCode, fetchGithubUser } from "./githubService";

export async function authenticateWithGithub(code: string) {
  const accessToken = await exchangeGithubCode(code);
  const githubUser = await fetchGithubUser(accessToken);
  const user = await prisma.user.upsert({
    where: { githubId: githubUser.id },
    update: { username: githubUser.login, email: githubUser.email, avatarUrl: githubUser.avatar_url, githubAccessToken: encrypt(accessToken) },
    create: { githubId: githubUser.id, username: githubUser.login, email: githubUser.email, avatarUrl: githubUser.avatar_url, githubAccessToken: encrypt(accessToken) },
  });
  return jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
}
