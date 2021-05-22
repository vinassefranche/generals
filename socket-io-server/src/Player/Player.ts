import * as string from "fp-ts/string";
import * as Eq from "fp-ts/Eq";

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
};
