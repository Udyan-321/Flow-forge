import { io } from "socket.io-client";

export function createSocket() {
  return io("http://localhost:5000", { withCredentials: true });
}
