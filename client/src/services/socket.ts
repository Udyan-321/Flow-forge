import { io } from "socket.io-client";

export function createSocket() {
  const token = localStorage.getItem("token");
  return io(import.meta.env.VITE_SERVER_URL, {
    auth: { token },
  });
}