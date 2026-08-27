import { io } from "socket.io-client";

export function createSocket() {
  return io(import.meta.env.VITE_SERVER_URL, { withCredentials: true });
}
