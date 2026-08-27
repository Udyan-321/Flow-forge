import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer , {
  cors:{
    origin : "http://localhost:5173",
    credentials : true
  }
});

export default {io , app , httpServer , express}