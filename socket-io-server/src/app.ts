import express from "express";
import * as http from "http";
import { Server, Socket } from "socket.io";
import { armyCell, Cell, emptyCell, mountainCell } from "./Cell";

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

// let interval: NodeJS.Timeout;

type Board = ReadonlyArray<ReadonlyArray<Cell>>;

const boardBase: Board = [
  [emptyCell, emptyCell, emptyCell],
  [mountainCell, emptyCell, emptyCell],
  [emptyCell, emptyCell, emptyCell],
];

let board = [...boardBase];
board[1] = [
  mountainCell,
  armyCell({ color: "blue", soldiersNumber: 1 }),
  emptyCell,
];
setInterval(() => {
  // console.log("board", board);
  sockets.forEach((socket) => socket.emit("board", board));
}, 1000);

let sockets: ReadonlyArray<Socket> = [];
io.on("connection", (socket) => {
  console.log("New client connected");
  sockets = [...sockets, socket];

  socket.on("move:right", function () {
    console.log("move:right");
    board[1] = [
      mountainCell,
      emptyCell,
      armyCell({ color: "blue", soldiersNumber: 1 }),
    ];
    // socket.emit("message", `received ${message}`);
  });
  socket.on("move:left", function () {
    console.log("move:left");
    board[1] = [
      mountainCell,
      armyCell({ color: "blue", soldiersNumber: 1 }),
      emptyCell,
    ];
    // socket.emit("message", `received ${message}`);
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    sockets = sockets.filter((sock) => sock !== socket);
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
