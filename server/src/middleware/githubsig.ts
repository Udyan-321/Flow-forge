import crypto from "crypto";


function verifyGithubSignature(req: any, res: any, next: any) {
  const signature = req.headers["x-hub-signature-256"];
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!signature) {
    return res.status(401).json({ error: "Missing signature" });
  }

  const expectedSignature = "sha256=" + crypto
    .createHmac("sha256", secret as string)
    .update(req.rawBody)
    .digest("hex");

  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature as string),
    Buffer.from(expectedSignature)
  );

  if (!isValid) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  next();
}

export default verifyGithubSignature;