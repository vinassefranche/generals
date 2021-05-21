import express from "express";
import * as http from "http";
import { Server, Socket } from "socket.io";

const port = process.env.PORT || 4001;
// const index = require("./routes/index");

const app = express();
// app.use(index);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
    // allowedHeaders: ["my-custom-header"],
    // credentials: true
  },
});

let interval: NodeJS.Timeout;

io.on("connection", (socket) => {
  console.log("New client connected");
  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => getApiAndEmit(socket), 1000);

  socket.on("message", function (message: any) {
    console.log(message);
    // echo the message back down the
    // websocket connection
    socket.emit("message", `received ${message}`);
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });
});

const getApiAndEmit = (socket: Socket) => {
  const response = new Date();
  // Emitting a new message. Will be consumed by the client
  socket.emit("FromAPI", response);
};

server.listen(port, () => console.log(`Listening on port ${port}`));
