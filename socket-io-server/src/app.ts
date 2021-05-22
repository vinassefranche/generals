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

type Cell = {
  type: "empty" | "mountain" | "army";
  color?: "blue";
};
type Board = ReadonlyArray<ReadonlyArray<Cell>>;

const boardBase: Board = [
  [{ type: "empty" }, { type: "empty" }, { type: "empty" }],
  [{ type: "mountain" }, { type: "empty" }, { type: "empty" }],
  [{ type: "empty" }, { type: "empty" }, { type: "empty" }],
];

const getBoard = (): Board => {
  const board = [...boardBase];
  const rand = Math.random();
  board[1] = [
    { type: "mountain" },
    { type: "army", color: "blue" },
    { type: "empty" },
  ];
  if (rand > 0.5) {
    board[1] = [
      { type: "mountain" },
      { type: "empty" },
      { type: "army", color: "blue" },
    ];
  }
  return board;
};

io.on("connection", (socket) => {
  console.log("New client connected");
  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => emitBoard(socket), 1000);

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

const emitBoard = (socket: Socket) => {
  // Emitting a new message. Will be consumed by the client
  socket.emit("board", getBoard());
};

server.listen(port, () => console.log(`Listening on port ${port}`));
