import * as string from "fp-ts/string";
import * as O from "fp-ts/Option";
import * as RA from "fp-ts/ReadonlyArray";
import * as RNEA from "fp-ts/ReadonlyNonEmptyArray";
import * as E from "fp-ts/Either";
import { constant, pipe } from "fp-ts/function";
import { armyCell, Cell, CellType, emptyCell, mountainCell } from "../Cell";
import { Player, PlayerColorEq, playerPossibleColors } from "../Player";

export type Board = ReadonlyArray<ReadonlyArray<Cell>>;

const columnShift = (where: "left" | "right" | "up" | "down") => {
  switch (where) {
    case "left":
      return -1;
    case "right":
      return 1;
    case "up":
    case "down":
      return 0;
  }
};
const rowShift = (where: "left" | "right" | "up" | "down") => {
  switch (where) {
    case "left":
    case "right":
      return 0;
    case "up":
      return -1;
    case "down":
      return 1;
  }
};

const findArmy = (player: Player, board: Board) => {
  for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
    const row = board[rowIndex];
    for (let columnIndex = 0; columnIndex < row.length; columnIndex++) {
      const cell = row[columnIndex];
      if (cell.type === CellType.Army && cell.color === player.color) {
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

export class Game {
  board: Board;
  players: Array<Player>;

  constructor() {
    this.board = [
      [emptyCell, emptyCell, emptyCell, mountainCell],
      [
        mountainCell,
        armyCell({ color: "blue", soldiersNumber: 1 }),
        emptyCell,
        armyCell({ color: "green", soldiersNumber: 1 }),
      ],
      [emptyCell, mountainCell, mountainCell, emptyCell],
      [mountainCell, emptyCell, emptyCell, emptyCell],
    ];
    this.players = [];
  }

  increaseAllArmy() {
    this.board = this.board.map((row) =>
      row.map((cell) =>
        cell.type === CellType.Army
          ? armyCell({
              color: cell.color,
              soldiersNumber: cell.soldiersNumber + 1,
            })
          : cell
      )
    );
  }

  moveArmy = (player: Player, where: "left" | "right" | "up" | "down") => {
    this.board = pipe(
      findArmy(player, this.board),
      O.chain(({ columnIndex, rowIndex, cell }) =>
        pipe(
          this.board,
          RA.modifyAt(rowIndex + rowShift(where), (row) =>
            pipe(
              row,
              RA.modifyAt(
                columnIndex + columnShift(where),
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
      O.getOrElse(constant(this.board))
    );
  };

  newPlayer = (): E.Either<Error, Player> =>
    pipe(
      playerPossibleColors,
      RA.difference(PlayerColorEq)(this.players.map((player) => player.color)),
      RNEA.fromReadonlyArray,
      E.fromOption(() => new Error("Maximum number of error reached")),
      E.map(RNEA.head),
      E.map((color) => ({ color })),
      E.map((player) => {
        this.players.push(player);
        return player;
      })
    );

  removePlayer = (player: Player) => {
    this.players = this.players.filter(
      (existingPlayer) => existingPlayer.color !== player.color
    );
  };
}
