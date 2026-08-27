import { io } from "../lib/socket";
import { authenticateSocket } from "./auth";
import { registerSocketHandlers } from "./handlers";

io.use(authenticateSocket);
registerSocketHandlers();
