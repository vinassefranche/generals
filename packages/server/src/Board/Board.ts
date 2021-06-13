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
  emptyCell,
} from "../Cell";
import * as ReadonlyArray from "fp-ts/ReadonlyArray";
import * as Array from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as RNEA from "fp-ts/ReadonlyNonEmptyArray";

import { Position } from "../Position";
import type { Player, PlayerColor } from "../Player";

export type Board = ReadonlyArray<ReadonlyArray<Cell>>;
type MutableBoard = Array<Array<Cell>>;
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
      const mutableBoard = board as MutableBoard;
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
          const cellsToCheck = getCellsToCheck({ columnIndex, rowIndex });
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

  export const getArmyNumbers = (
    players: RNEA.ReadonlyNonEmptyArray<Player>,
    board: Board
  ) =>
    board.reduce(
      (previousRowsNumbers, row) =>
        row.reduce((previousCellsNumbers, cell) => {
          if (
            Cell.isOccupied(cell) &&
            cell.color !== null &&
            previousCellsNumbers[cell.color] !== undefined
          ) {
            return {
              ...previousCellsNumbers,
              [cell.color]:
                previousCellsNumbers[cell.color] + cell.soldiersNumber,
            };
          }
          return previousCellsNumbers;
        }, previousRowsNumbers),
      players.reduce(
        (memo, player) => ({ ...memo, [player.color]: 0 }),
        {} as Record<PlayerColor, number>
      )
    );

  export const generateNewBoard = ({
    playerColors,
  }: {
    size: "medium";
    playerColors: RNEA.ReadonlyNonEmptyArray<PlayerColor>;
  }): E.Either<Error, Board> => {
    const boardSize = 25;
    const emptyBoard: MutableBoard = Array.makeBy(boardSize, () =>
      Array.makeBy(boardSize, () => emptyCell)
    );
    for (
      let playerIndex = 0;
      playerIndex < playerColors.length;
      playerIndex++
    ) {
      const playerColor = playerColors[playerIndex];
      switch (playerIndex % 4) {
        case 0:
          let playerCellFound = false;
          for (let columnIndex = 0; columnIndex < boardSize; columnIndex++) {
            const cell = emptyBoard[0][columnIndex];
            if (cell.type === CellType.Empty) {
              console.log("been here too");
              emptyBoard[0][columnIndex] = crownCell({
                color: playerColor,
                soldiersNumber: 0,
              });
              playerCellFound = true;
              break;
            }
          }
          if (playerCellFound) {
            break;
          }
          return E.left(
            new Error(`Could not find an empty cell for player ${playerColor}`)
          );
        case 1:
          for (
            let columnIndex = boardSize - 1;
            columnIndex >= 0;
            columnIndex--
          ) {
            const cell = emptyBoard[boardSize - 1][columnIndex];
            if (cell.type === CellType.Empty) {
              emptyBoard[boardSize - 1][columnIndex] = crownCell({
                color: playerColor,
                soldiersNumber: 0,
              });
              break;
            }
          }
          return E.left(
            new Error(`Could not find an empty cell for player ${playerColor}`)
          );
        case 3:
          for (let rownIndex = 0; rownIndex < boardSize; rownIndex++) {
            const cell = emptyBoard[rownIndex][boardSize - 1];
            if (cell.type === CellType.Empty) {
              emptyBoard[rownIndex][boardSize - 1] = crownCell({
                color: playerColor,
                soldiersNumber: 0,
              });
              break;
            }
          }
          return E.left(
            new Error(`Could not find an empty cell for player ${playerColor}`)
          );
        case 3:
          for (let rownIndex = boardSize - 1; rownIndex >= 0; rownIndex--) {
            const cell = emptyBoard[rownIndex][0];
            if (cell.type === CellType.Empty) {
              emptyBoard[rownIndex][0] = crownCell({
                color: playerColor,
                soldiersNumber: 0,
              });
              break;
            }
          }
          return E.left(
            new Error(`Could not find an empty cell for player ${playerColor}`)
          );
      }
    }
    return E.right(emptyBoard);
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

const getCellsToCheck = ({
  rowIndex,
  columnIndex,
}: {
  rowIndex: number;
  columnIndex: number;
}) => [
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
