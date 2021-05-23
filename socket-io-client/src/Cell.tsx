import styled, { css } from "styled-components";
import { PlayerColor } from "./Player";

enum CellType {
  Empty = "empty",
  Mountain = "mountain",
  Army = "army",
  Castle = "castle",
  Crown = "crown",
}

export type CellT = EmptyCell | MoutainCell | ArmyCell | CastleCell | CrownCell;

export type EmptyCell = {
  readonly type: CellType.Empty;
};

export type MoutainCell = {
  readonly type: CellType.Mountain;
};

export type ArmyCell = {
  readonly type: CellType.Army;
  readonly color: PlayerColor;
  readonly soldiersNumber: number;
};

export type CastleCell = {
  readonly type: CellType.Castle;
  readonly color: PlayerColor;
  readonly soldiersNumber: number;
};

export type CrownCell = {
  readonly type: CellType.Crown;
  readonly color: PlayerColor;
  readonly soldiersNumber: number;
};

export const Cell = ({ cell, active }: { cell: CellT; active: boolean }) => {
  if (cell.type === CellType.Mountain) {
    return <StyledMountainCell active={active}>&#9968;</StyledMountainCell>;
  }
  if (cell.type === CellType.Army) {
    return (
      <StyledCell color={cell.color} active={active}>
        {cell.soldiersNumber}
      </StyledCell>
    );
  }
  return <StyledCell active={active}> </StyledCell>;
};

const StyledCell = styled.div<{ color?: string; active: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  ${({ color }) =>
    color &&
    css`
      background-color: ${color};
    `}
  border-color: black;
  border-color: ${({ active }) => (active ? "white" : "black")};
  border-style: solid;
  border-width: ${({ active }) => (active ? 2 : 1)}px;
  border-width: 1px;

  width: 50px;
  height: 50px;
  font-size: 20px;
`;
const StyledMountainCell = styled(StyledCell)`
  font-size: 40px;
`;
