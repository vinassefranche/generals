import * as O from "fp-ts/Option";
import * as RA from "fp-ts/ReadonlyArray";
import { constant, pipe } from "fp-ts/function";
import express from "express";
import * as http from "http";
import { Server, Socket } from "socket.io";
import { armyCell, Cell, emptyCell, mountainCell, CellType } from "./Cell";

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

let board: Board = [
  [emptyCell, emptyCell, emptyCell],
  [mountainCell, armyCell({ color: "blue", soldiersNumber: 1 }), emptyCell],
  [emptyCell, emptyCell, emptyCell],
];

const findArmy = () => {
  for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
    const row = board[rowIndex];
    for (let columnIndex = 0; columnIndex < row.length; columnIndex++) {
      const cell = row[columnIndex];
      if (cell.type === CellType.Army) {
        return O.some({
          rowIndex,
          columnIndex,
          cell,
        });
      }
    }
  }
  return O.none;
};

const moveArmy = (board: Board, where: "left" | "right") =>
  pipe(
    findArmy(),
    O.chain(({ columnIndex, rowIndex, cell }) =>
      pipe(
        board,
        RA.modifyAt(rowIndex, (row) =>
          pipe(
            row,
            RA.modifyAt(
              columnIndex + (where === "left" ? -1 : 1),
              (): Cell =>
                armyCell({
                  color: cell.color,
                  soldiersNumber: cell.soldiersNumber,
                })
            ),
            O.getOrElse(() => row)
          )
        )
      )
    ),
    O.getOrElse(constant(board))
  );

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
    board = moveArmy(board, "right");
    // socket.emit("message", `received ${message}`);
  });
  socket.on("move:left", function () {
    console.log("move:left");
    board = moveArmy(board, "left");
    // socket.emit("message", `received ${message}`);
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    sockets = sockets.filter((sock) => sock !== socket);
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
