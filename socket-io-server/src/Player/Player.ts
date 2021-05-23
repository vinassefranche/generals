import * as string from "fp-ts/string";
import * as Eq from "fp-ts/Eq";
import { Board } from "../Board";

export type PlayerColor = "blue" | "red" | "yellow" | "green";
export const playerPossibleColors: ReadonlyArray<PlayerColor> = [
  "blue",
  "green",
  "red",
  "yellow",
];

export const PlayerColorEq: Eq.Eq<PlayerColor> = string.Eq;

export type Player = {
  color: PlayerColor;
  name: string;
  refreshBoard: (board: Board) => void;
};

export namespace Player {
  export const refreshBoard = (board: Board) => (player: Player) =>
    player.refreshBoard(board);
}
