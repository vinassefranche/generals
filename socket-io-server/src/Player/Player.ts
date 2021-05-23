import * as string from "fp-ts/string";
import * as number from "fp-ts/number";
import * as FPEq from "fp-ts/Eq";
import { Board } from "../Board";
import { Position } from "../Position";

export type PlayerColor = "blue" | "red" | "yellow" | "green";
export const playerPossibleColors: ReadonlyArray<PlayerColor> = [
  "blue",
  "green",
  "red",
  "yellow",
];

export const PlayerColorEq: FPEq.Eq<PlayerColor> = string.Eq;

export type PlayerMove = {
  from: Position.T;
  to: Position.T;
};

export type Player = {
  color: PlayerColor;
  name: string;
  refreshBoard: (board: Board) => void;
  moves: Array<PlayerMove>;
};

export namespace Player {
  export const refreshBoard = (board: Board) => (player: Player) =>
    player.refreshBoard(board);

  export const newPlayer = (props: Omit<Player, "moves">): Player => ({
    ...props,
    moves: [],
  });
}
