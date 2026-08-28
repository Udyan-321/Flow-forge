import jwt from "jsonwebtoken";
import { Socket } from "socket.io";

export function authenticateSocket(socket: Socket, next: (error?: Error) => void) {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Unauthorized"));
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    socket.data.userId = decoded.userId;
    next();
  } catch (_error) {
    next(new Error("Unauthorized"));
  }
}