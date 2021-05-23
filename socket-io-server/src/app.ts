import express from "express";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as http from "http";
import { Server } from "socket.io";
import { Game } from "./Game";
import { PlayerMove } from "./Player";

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

  socket.on("startGame", (callback) => {
    if (game.players.length === 0) {
      callback({
        ok: false,
        reason: "No players registerd, cannot start the game",
      });
    }
    game.start();
    callback({ ok: true });
  });

  socket.on("endGame", () => {
    game.end();
    socket.emit("gameEnded");
    socket.broadcast.emit("gameEnded");
  });

  socket.on("joinGame", (playerData: { name: string }, callback) =>
    pipe(
      game.newPlayer({
        name: playerData.name,
        refreshBoard: (board) => socket.emit("board", board),
      }),
      E.map((player) => {
        socket.on(`move`, (move: PlayerMove, callback) =>
          pipe(
            game.checkMoveIsValid(player, move),
            E.map(() => {
              player.moves.push(move);
            }),
            E.match(
              (error) => callback({ ok: false, reason: error.message }),
              () => callback({ ok: true })
            )
          )
        );
        socket.on("disconnect", () => {
          game.removePlayer(player);
          if (game.players.length === 0) {
            game.end();
          }
        });
        return player;
      }),
      E.map(({ color, name }) => ({ color, name })),
      E.match(
        (error) => callback({ ok: false, reason: error.message }),
        (player) => callback({ ok: true, player })
      )
    )
  );
});

server.listen(port, () => console.log(`Listening on port ${port}`));
