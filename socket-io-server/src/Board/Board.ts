import {
  armyCell,
  Cell,
  CellType,
  crownCell,
  occupiedCastleCell,
  OccupableCell,
  OccupiedCell,
} from "../Cell";
import * as ReadonlyArray from "fp-ts/ReadonlyArray";
import { Position } from "../Position";
import { Player } from "../Player";

export type Board = ReadonlyArray<ReadonlyArray<Cell>>;

export namespace Board {
  export const increaseAllArmyCells = ({
    increaseNormalArmyCells,
  }: {
    increaseNormalArmyCells: boolean;
  }): ((board: Board) => Board) =>
    ReadonlyArray.map((row) =>
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

  export const applyPlayerMove =
    ({
      to,
      from,
      player,
    }: {
      to: { position: Position.T; cell: OccupableCell };
      from: { position: Position.T; cell: OccupiedCell };
      player: Player;
    }) =>
    (board: Board): Board => {
      const mutableBoard = board as Array<Array<Cell>>;
      mutableBoard[to.position.row][to.position.column] = {
        type: to.cell.type === CellType.Empty ? CellType.Army : to.cell.type,
        color: player.color,
        soldiersNumber:
          from.cell.soldiersNumber -
          1 +
          (Cell.isEmpty(to.cell) || to.cell.color !== player.color
            ? 0
            : to.cell.soldiersNumber),
      };
      mutableBoard[from.position.row][from.position.column] = {
        type: from.cell.type,
        color: player.color,
        soldiersNumber: 1,
      };
      return mutableBoard as Board;
    };
}
