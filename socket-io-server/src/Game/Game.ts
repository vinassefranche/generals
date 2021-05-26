import * as string from "fp-ts/string";
import * as O from "fp-ts/Option";
import * as RA from "fp-ts/ReadonlyArray";
import * as RNEA from "fp-ts/ReadonlyNonEmptyArray";
import * as E from "fp-ts/Either";
import { constant, constVoid, flow, pipe } from "fp-ts/function";
import {
  armyCell,
  Cell,
  CellType,
  crownCell,
  emptyCastleCell,
  emptyCell,
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
      this.resolvePlayersNextMove();
      this.board = Board.increaseAllArmyCells({
        increaseNormalArmyCells: this.counter % 15 === 0,
      })(this.board);
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

  resolvePlayersNextMove = () => {
    this.players.forEach((player) =>
      pipe(
        player.moves,
        RA.head,
        O.map((move) =>
          pipe(
            this.checkMoveIsValidNow(player, move),
            O.fromEither,
            O.map(({ toCell, fromCell }) => {
              this.board[move.to.row][move.to.column] = {
                type:
                  toCell.type === CellType.Empty ? CellType.Army : toCell.type,
                color: player.color,
                soldiersNumber:
                  fromCell.soldiersNumber -
                  1 +
                  (Cell.isEmpty(toCell) || toCell.color !== player.color
                    ? 0
                    : toCell.soldiersNumber),
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
          O.fromPredicate(Cell.belongsToPlayer(player)),
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
              Cell.isOccupable,
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
          Cell.belongsToPlayer(player),
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
              Cell.isOccupable,
              () => new Error("given to cell is not occupable")
            )
          )
        )
      ),
      E.chainFirstW(
        E.fromPredicate(
          ({ fromCell, toCell }) =>
            (Cell.isEmpty(toCell) || toCell.color === player.color) &&
            fromCell.soldiersNumber > 1,
          () => new Error("not enough army in fromCell to gain toCell")
        )
      )
    );

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
