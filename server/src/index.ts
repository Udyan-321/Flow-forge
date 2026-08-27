import dotenv from "dotenv";
import { app, httpServer } from "./lib/socket";
import { configureApp } from "./app";
import "./socket/server";
import "./workers/webhookWorker";

dotenv.config();
configureApp(app);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
