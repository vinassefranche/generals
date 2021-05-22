import express from "express";
import * as http from "http";
import { Server, Socket } from "socket.io";
import { armyCell, Cell, emptyCell, mountainCell, CellType } from "./Cell";
import { Game, Board } from "./Game";

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

let game: Game | undefined = undefined;

let counter = 0;

setInterval(() => {
  if (!game) {
    return;
  }
  counter++;
  if (counter === 15) {
    game.increaseAllArmy();
    counter = 0;
  }
  const board = game.board;
  sockets.forEach((socket) => socket.emit("board", board));
}, 1000);

let sockets: ReadonlyArray<Socket> = [];
io.on("connection", (socket) => {
  console.log("New client connected");
  if (!game) {
    game = new Game();
  }
  sockets = [...sockets, socket];

  socket.on("move:right", function () {
    if (!game) {
      return;
    }
    console.log("move:right");
    game.moveArmy("right");
    // socket.emit("message", `received ${message}`);
  });
  socket.on("move:left", function () {
    if (!game) {
      return;
    }
    console.log("move:left");
    game.moveArmy("left");
    // socket.emit("message", `received ${message}`);
  });
  socket.on("move:up", function () {
    if (!game) {
      return;
    }
    console.log("move:up");
    game.moveArmy("up");
    // socket.emit("message", `received ${message}`);
  });
  socket.on("move:down", function () {
    if (!game) {
      return;
    }
    console.log("move:down");
    game.moveArmy("down");
    // socket.emit("message", `received ${message}`);
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    sockets = sockets.filter((sock) => sock !== socket);
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
