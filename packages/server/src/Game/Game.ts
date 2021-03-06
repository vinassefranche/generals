import * as E from "fp-ts/Either";
import { flow, identity, pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import * as RA from "fp-ts/ReadonlyArray";
import * as RNEA from "fp-ts/ReadonlyNonEmptyArray";
import { Board } from "../Board";
import {
  armyCell,
  Cell,
  crownCell,
  emptyCastleCell,
  emptyCell,
  mountainCell,
  occupiedCastleCell,
} from "../Cell";
import {
  Player,
  PlayerColor,
  PlayerColorEq,
  PlayerMove,
  playerPossibleColors,
} from "../Player";
import { Position } from "../Position";

const REFRESH_INTERVAL = 500;

export class Game {
  board: Board;
  players: ReadonlyArray<Player>;
  refreshInterval?: NodeJS.Timeout;
  counter: number = 0;

  constructor() {
    this.board = [];
    this.players = [];
  }

  get hasStarted() {
    return !!this.refreshInterval;
  }

  start = () =>
    pipe(
      !this.hasStarted,
      E.fromPredicate(identity, () => new Error("game has already started")),
      E.chain(() =>
        pipe(
          this.players,
          RNEA.fromReadonlyArray,
          E.fromOption(() => new Error("Game cannot start without any player"))
        )
      ),
      E.bindTo("players"),
      E.bindW("board", ({ players }) =>
        Board.generateNewBoard({
          size: "medium",
          playerColors: pipe(
            players,
            RNEA.map((player) => player.color)
          ),
        })
      ),
      E.map(({ players, board }) => {
        this.board = board;
        this.refreshGameForAllPlayers(
          Board.getArmyNumbers(players, this.board)
        );
        this.counter = 0;
        this.refreshInterval = setInterval(() => {
          this.counter++;
          this.resolvePlayersNextMove();
          if (this.counter % 2 === 0) {
            this.board = Board.increaseAllArmyCells({
              increaseNormalArmyCells: this.counter % 30 === 0,
            })(this.board);
          }
          this.refreshGameForAllPlayers(
            Board.getArmyNumbers(players, this.board)
          );
        }, REFRESH_INTERVAL);
      })
    );

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
              this.board = Board.applyPlayerMove({
                to: {
                  cell: toCell,
                  position: move.to,
                },
                from: {
                  cell: fromCell,
                  position: move.from,
                },
                player,
              })(this.board);
            }),
            O.match(
              () => {
                player.moves = [];
              },
              () => {
                const [_, ...rest] = player.moves;
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
          ({ fromCell }) => fromCell.soldiersNumber > 1,
          () => new Error("Only 1 soldier left in fromCell, cannot move")
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
      E.fromOption(() => new Error("Maximum number of players reached")),
      E.map(RNEA.head),
      E.map((color) => Player.newPlayer({ color, ...player })),
      E.map((player) => {
        this.players = [...this.players, player];
        return player;
      })
    );
  };

  removePlayer = (player: Player) => {
    this.players = this.players.filter(
      (existingPlayer) => existingPlayer.color !== player.color
    );
  };

  refreshGameForAllPlayers = (armyNumbers: Record<PlayerColor, number>) => {
    const { board } = this;
    // console.log(Board.getArmyNumbers(board));
    this.players.forEach((player) => {
      player.refreshGame({
        board: Board.getBoardForPlayer(board)(player),
        armyNumbers,
      });
    });
  };
}
