import * as string from "fp-ts/string";
import * as O from "fp-ts/Option";
import * as RA from "fp-ts/ReadonlyArray";
import * as RNEA from "fp-ts/ReadonlyNonEmptyArray";
import * as E from "fp-ts/Either";
import { constant, constVoid, flow, pipe } from "fp-ts/function";
import {
  armyCell,
  Cell,
  cellBelongsToPlayer,
  CellType,
  crownCell,
  emptyCastleCell,
  emptyCell,
  isOccupableCell,
  mountainCell,
  occupiedCastleCell,
} from "../Cell";
import { Board } from "../Board";
import {
  Player,
  PlayerColorEq,
  PlayerMove,
  playerPossibleColors,
} from "../Player";
import { Position } from "../Position";

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
  refreshInterval?: NodeJS.Timeout;
  counter: number = 0;

  constructor() {
    this.board = [];
    this.players = [];
  }

  get hasStarted() {
    return !!this.refreshInterval;
  }

  start = () => {
    if (this.hasStarted) {
      return E.left(new Error("game has already started"));
    }
    this.board = [
      [
        emptyCell,
        armyCell({ color: "blue", soldiersNumber: 1 }),
        emptyCell,
        mountainCell,
      ],
      [
        mountainCell,
        crownCell({ color: "blue", soldiersNumber: 1 }),
        emptyCell,
        armyCell({ color: "green", soldiersNumber: 1 }),
      ],
      [
        // occupiedCastleCell({ color: "blue", soldiersNumber: 1 }),
        emptyCastleCell,
        mountainCell,
        mountainCell,
        emptyCell,
      ],
      [mountainCell, emptyCell, emptyCell, emptyCell],
    ];
    this.counter = 0;
    this.refreshBoardForAllPlayers();
    this.refreshInterval = setInterval(() => {
      this.counter++;
      this.resolveNextPlayerMove();
      this.increaseAllArmyCells({
        increaseNormalArmyCells: this.counter % 15 === 0,
      });
      this.refreshBoardForAllPlayers();
    }, 1500);
    return E.right(constVoid());
  };

  end = () => {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = undefined;
    }
    this.players = [];
  };

  increaseAllArmyCells({
    increaseNormalArmyCells,
  }: {
    increaseNormalArmyCells: boolean;
  }) {
    this.board = this.board.map((row) =>
      row.map((cell) => {
        if (cell.type === CellType.Army && increaseNormalArmyCells) {
          return armyCell({
            color: cell.color,
            soldiersNumber: cell.soldiersNumber + 1,
          });
        }
        if (cell.type === CellType.Crown) {
          return crownCell({
            color: cell.color,
            soldiersNumber: cell.soldiersNumber + 1,
          });
        }
        if (cell.type === CellType.OccupiedCastle) {
          return occupiedCastleCell({
            color: cell.color,
            soldiersNumber: cell.soldiersNumber + 1,
          });
        }
        return cell;
      })
    );
  }

  resolveNextPlayerMove = () => {
    this.players.forEach((player) =>
      pipe(
        player.moves,
        RA.head,
        O.map((move) =>
          pipe(
            this.checkMoveIsValidNow(player, move),
            O.fromEither,
            O.map(({ toCell, fromCell }) => {
              console.log("modifying board");
              this.board[move.to.row][move.to.column] = {
                type:
                  toCell.type === CellType.Empty ? CellType.Army : toCell.type,
                color: player.color,
                soldiersNumber: fromCell.soldiersNumber - 1,
              };
              this.board[move.from.row][move.from.column] = {
                type: fromCell.type,
                color: player.color,
                soldiersNumber: 1,
              };
            }),
            O.match(
              () => {
                player.moves = [];
              },
              () => {
                const [consumedMove, ...rest] = player.moves;
                player.moves = rest;
              }
            )
          )
        )
      )
    );
  };

  checkMoveIsValid = (player: Player, move: PlayerMove) =>
    pipe(
      this.board,
      RA.lookup(move.from.row),
      O.chain(flow(RA.lookup(move.from.column))),
      E.fromOption(() => new Error("given from cell is out of board")),
      E.chain(
        flow(
          O.fromPredicate(cellBelongsToPlayer(player)),
          O.altW(() =>
            RA.findFirst((previousMove: PlayerMove) =>
              Position.Eq.equals(previousMove.to, move.from)
            )(player.moves)
          ),
          E.fromOption(
            () =>
              new Error(
                "given from cell does not belong to player and is not in previous moves"
              )
          )
        )
      ),
      E.chain(() =>
        pipe(
          this.board,
          RA.lookup(move.to.row),
          O.chain(flow(RA.lookup(move.to.column))),
          E.fromOption(() => new Error("given to cell is out of board")),
          E.chain(
            E.fromPredicate(
              isOccupableCell,
              () => new Error("given to cell is not occupable")
            )
          )
        )
      )
    );

  checkMoveIsValidNow = (player: Player, move: PlayerMove) =>
    pipe(
      this.board,
      RA.lookup(move.from.row),
      O.chain(flow(RA.lookup(move.from.column))),
      E.fromOption(() => new Error("given from cell is out of board")),
      E.chain(
        E.fromPredicate(
          cellBelongsToPlayer(player),
          () => new Error("given from cell does not belong to player")
        )
      ),
      E.bindTo("fromCell"),
      E.bind("toCell", () =>
        pipe(
          this.board,
          RA.lookup(move.to.row),
          O.chain(flow(RA.lookup(move.to.column))),
          E.fromOption(() => new Error("given to cell is out of board")),
          E.chain(
            E.fromPredicate(
              isOccupableCell,
              () => new Error("given to cell is not occupable")
            )
          )
        )
      )
    );

  // moveArmy = (player: Player, where: "left" | "right" | "up" | "down") => {
  //   this.board = pipe(
  //     findArmy(player, this.board),
  //     O.chain(({ columnIndex, rowIndex, cell }) =>
  //       pipe(
  //         this.board,
  //         RA.modifyAt(rowIndex + rowShift(where), (row) =>
  //           pipe(
  //             row,
  //             RA.modifyAt(
  //               columnIndex + columnShift(where),
  //               (): Cell =>
  //                 armyCell({
  //                   color: cell.color,
  //                   soldiersNumber: cell.soldiersNumber,
  //                 })
  //             ),
  //             O.getOrElse(() => row)
  //           )
  //         )
  //       )
  //     ),
  //     O.getOrElse(constant(this.board))
  //   );
  // };

  newPlayer = (
    player: Omit<Player, "color" | "moves">
  ): E.Either<Error, Player> => {
    if (this.hasStarted) {
      return E.left(new Error("The game has already started"));
    }
    return pipe(
      playerPossibleColors,
      RA.difference(PlayerColorEq)(this.players.map((player) => player.color)),
      RNEA.fromReadonlyArray,
      E.fromOption(() => new Error("Maximum number of error reached")),
      E.map(RNEA.head),
      E.map((color) => Player.newPlayer({ color, ...player })),
      E.map((player) => {
        this.players.push(player);
        return player;
      })
    );
  };

  removePlayer = (player: Player) => {
    this.players = this.players.filter(
      (existingPlayer) => existingPlayer.color !== player.color
    );
  };

  refreshBoardForAllPlayers = () => {
    console.log("refreshing board for all players");
    const { board } = this;
    this.players.forEach(Player.refreshBoard(board));
  };
}
