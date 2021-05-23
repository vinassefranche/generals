import express from "express";
import * as http from "http";
import * as E from "fp-ts/Either";
import { Server, Socket } from "socket.io";
import { Game } from "./Game";

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

const game = new Game();

io.on("connection", (socket) => {
  console.log("New client connected");
  if (!game.hasStarted) {
    game.start();
  }
  const playerTry = game.newPlayer((board) => socket.emit("board", board));
  if (E.isLeft(playerTry)) {
    console.log("error initializing player");
    return;
  }
  const player = playerTry.right;

  (["right", "left", "up", "down"] as const).forEach((direction) => {
    socket.on(`move:${direction}`, () => game.moveArmy(player, direction));
  });
  socket.on("disconnect", () => {
    game.removePlayer(player);
    if (game.players.length === 0) {
      game.end();
    }
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
