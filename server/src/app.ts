import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import authRoutes from "./routes/authRoutes";
import workflowRoutes from "./routes/workflowRoutes";
import runRoutes from "./routes/runRoutes";
import webhookRoutes from "./routes/webhookRoutes";

export function configureApp(app: express.Express) {
  app.use(cookieParser());
  app.use(express.json({ verify: (req: any, _res, buffer) => { req.rawBody = buffer; } }));
  app.use(cors({ origin:process.env.CLIENT_URL, credentials: true }));
  app.use("/auth", authRoutes);
  app.use(workflowRoutes);
  app.use(runRoutes);
  app.use("/webhook", webhookRoutes);
  app.get("/", (_req, res) => res.send("Flow Forge server is alive"));
}
