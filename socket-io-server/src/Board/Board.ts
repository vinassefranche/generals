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
      console.log("applyPlayerMove", to, from);
      const mutableBoard = board as Array<Array<Cell>>;
      const soldiersThatMoveNumber = from.cell.soldiersNumber - 1;
      const soldiersToFightNumber = getSoldiersToFightNumber(to.cell, player);
      const soldiersNumberDifference =
        soldiersThatMoveNumber - soldiersToFightNumber;
      if (Cell.isEmpty(to.cell)) {
        mutableBoard[to.position.row][to.position.column] = {
          type: to.cell.type === CellType.Empty ? CellType.Army : to.cell.type,
          color: player.color,
          soldiersNumber: soldiersNumberDifference,
        };
      } else {
        mutableBoard[to.position.row][to.position.column] = {
          type: to.cell.type,
          color: soldiersNumberDifference > 0 ? player.color : to.cell.color,
          soldiersNumber: Math.abs(soldiersNumberDifference),
        };
      }
      mutableBoard[from.position.row][from.position.column] = {
        type: from.cell.type,
        color: player.color,
        soldiersNumber: 1,
      };
      return mutableBoard as Board;
    };
}

const getSoldiersToFightNumber = (cell: OccupableCell, player: Player) => {
  if (Cell.isEmpty(cell)) {
    return 0;
  }
  if (cell.color === player.color) {
    return -cell.soldiersNumber;
  }
  return cell.soldiersNumber;
};
