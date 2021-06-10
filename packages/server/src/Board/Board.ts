import {
  armyCell,
  Cell,
  CellType,
  crownCell,
  occupiedCastleCell,
  OccupableCell,
  OccupiedCell,
  UnknownCell,
  unknownCell,
} from "../Cell";
import * as ReadonlyArray from "fp-ts/ReadonlyArray";
import { Position } from "../Position";
import type { Player } from "../Player";

export type Board = ReadonlyArray<ReadonlyArray<Cell>>;
export type BoardForPlayer = ReadonlyArray<ReadonlyArray<Cell | UnknownCell>>;

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
        if (cell.type === CellType.OccupiedCastle && cell.color !== null) {
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
      switch (to.cell.type) {
        case CellType.Empty:
          mutableBoard[to.position.row][to.position.column] = {
            type: CellType.Army,
            color: player.color,
            soldiersNumber: soldiersNumberDifference,
          };
          break;
        case CellType.EmptyCastle:
          mutableBoard[to.position.row][to.position.column] = {
            type: CellType.OccupiedCastle,
            color: player.color,
            soldiersNumber: soldiersNumberDifference,
          };
          break;
        case CellType.Army:
        case CellType.Crown:
          mutableBoard[to.position.row][to.position.column] = {
            type: to.cell.type,
            color: soldiersNumberDifference > 0 ? player.color : to.cell.color,
            soldiersNumber: Math.abs(soldiersNumberDifference),
          };
          break;
        case CellType.OccupiedCastle:
          mutableBoard[to.position.row][to.position.column] = {
            type: to.cell.type,
            color: soldiersNumberDifference > 0 ? player.color : to.cell.color,
            soldiersNumber: Math.abs(soldiersNumberDifference),
          };
          break;
      }
      mutableBoard[from.position.row][from.position.column] = {
        type: from.cell.type,
        color: player.color,
        soldiersNumber: 1,
      };
      return mutableBoard as Board;
    };

  export const getBoardForPlayer =
    (board: Board) =>
    (player: Player): BoardForPlayer =>
      board.map((row, rowIndex) =>
        row.map((cell, columnIndex) => {
          if (
            Cell.belongsToPlayer(player)(cell) ||
            cell.type === CellType.Mountain
          ) {
            return cell;
          }
          const cellsToCheck = [
            {
              row: rowIndex - 1,
              column: columnIndex - 1,
            },
            {
              row: rowIndex - 1,
              column: columnIndex,
            },
            {
              row: rowIndex - 1,
              column: columnIndex + 1,
            },
            {
              row: rowIndex,
              column: columnIndex - 1,
            },
            {
              row: rowIndex,
              column: columnIndex + 1,
            },
            {
              row: rowIndex + 1,
              column: columnIndex - 1,
            },
            {
              row: rowIndex + 1,
              column: columnIndex,
            },
            {
              row: rowIndex + 1,
              column: columnIndex + 1,
            },
          ];
          for (let index = 0; index < cellsToCheck.length; index++) {
            const cellToCheck = cellsToCheck[index];
            if (
              board[cellToCheck.row] &&
              board[cellToCheck.row][cellToCheck.column] &&
              Cell.belongsToPlayer(player)(
                board[cellToCheck.row][cellToCheck.column]
              )
            ) {
              return cell;
            }
          }
          return unknownCell;
        })
      );
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
