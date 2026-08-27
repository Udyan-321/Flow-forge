import prisma from "../lib/prisma";
import { io } from "../lib/socket";

export function registerSocketHandlers() {
  io.on("connection", (socket) => {
    console.log("A user is connected", socket.id);

    socket.on("disconnect", () => {
      console.log("User is disconnected", socket.id);
    });

    socket.on("join-workflow", async (workflowId) => {
      const workflow = await prisma.workflow.findUnique({ where: { id: workflowId } });
      if (!workflow || workflow.userId !== socket.data.userId) {
        return socket.emit("error", "Unauthorized");
      }
      socket.join(`workflow:${workflowId}`);
    });
  });
}
