import jwt from "jsonwebtoken";
import { Socket } from "socket.io";
import { parseCookies } from "../utils/cookies";

export function authenticateSocket(socket: Socket, next: (error?: Error) => void) {
  try {
    const cookies = parseCookies(socket.handshake.headers.cookie || "");
    const token = cookies.token;
    if (!token) return next(new Error("Unauthorized"));
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    socket.data.userId = decoded.userId;
    next();
  } catch (_error) {
    next(new Error("Unauthorized"));
  }
}
