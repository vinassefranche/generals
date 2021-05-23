import express from "express";
import * as http from "http";
import * as E from "fp-ts/Either";
import { Server, Socket } from "socket.io";
import { Game } from "./Game";
import { pipe } from "fp-ts/function";
import { Player } from "./Player";

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

  socket.on("startGame", () => game.start());

  let player: Player | undefined;
  socket.on("joinGame", (playerData: { name: string }, callback) =>
    pipe(
      game.newPlayer({
        name: playerData.name,
        refreshBoard: (board) => socket.emit("board", board),
      }),
      E.map((player) => {
        player = player;
        (["right", "left", "up", "down"] as const).forEach((direction) => {
          socket.on(`move:${direction}`, () =>
            game.moveArmy(player, direction)
          );
        });
        return player;
      }),
      E.map(({ color, name }) => ({ color, name })),
      E.match(
        () => callback({ ok: false }),
        (player) => callback({ ok: true, player })
      )
    )
  );

  socket.on("disconnect", () => {
    if (!player) {
      return;
    }
    game.removePlayer(player);
    if (game.players.length === 0) {
      game.end();
    }
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
