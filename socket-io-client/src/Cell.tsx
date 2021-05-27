import styled, { css } from "styled-components";
import { PlayerColor } from "./Player";

export enum CellType {
  Empty = "empty",
  Mountain = "mountain",
  Army = "army",
  EmptyCastle = "emptyCastle",
  OccupiedCastle = "occupiedCastle",
  Crown = "crown",
}

export type CellT =
  | EmptyCell
  | MoutainCell
  | ArmyCell
  | EmptyCastleCell
  | OccupiedCastleCell
  | CrownCell;

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

export type EmptyCastleCell = {
  readonly type: CellType.EmptyCastle;
};

export type OccupiedCastleCell = {
  readonly type: CellType.OccupiedCastle;
  readonly color: PlayerColor;
  readonly soldiersNumber: number;
};

export type CrownCell = {
  readonly type: CellType.Crown;
  readonly color: PlayerColor;
  readonly soldiersNumber: number;
};

export const Cell = ({
  cell,
  active,
  onClick,
}: {
  cell: CellT;
  active: boolean;
  onClick: () => void;
}) => {
  if (cell.type === CellType.Mountain) {
    return <CellWithOnlyIcon active={active}>&#9968;</CellWithOnlyIcon>;
  }
  if (cell.type === CellType.EmptyCastle) {
    return <CellWithOnlyIcon active={active}>&#127984;</CellWithOnlyIcon>;
  }
  if (cell.type === CellType.Army) {
    return (
      <StyledCell color={cell.color} active={active} onClick={onClick}>
        {cell.soldiersNumber}
      </StyledCell>
    );
  }
  if (cell.type === CellType.Crown) {
    return (
      <CellWithIconAndNumber
        active={active}
        color={cell.color}
        onClick={onClick}
      >
        <SoldierNumberInCellWithIcon>
          {cell.soldiersNumber}
        </SoldierNumberInCellWithIcon>
        <span>&#9813;</span>
      </CellWithIconAndNumber>
    );
  }

  if (cell.type === CellType.OccupiedCastle) {
    return (
      <CellWithIconAndNumber
        active={active}
        color={cell.color}
        onClick={onClick}
      >
        <SoldierNumberInCellWithIcon>
          {cell.soldiersNumber}
        </SoldierNumberInCellWithIcon>
        <span>&#127984;</span>
      </CellWithIconAndNumber>
    );
  }

  return (
    <StyledCell active={active} onClick={onClick}>
      {" "}
    </StyledCell>
  );
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
  color: white;
`;
const CellWithOnlyIcon = styled(StyledCell)`
  font-size: 40px;
`;

const CellWithIconAndNumber = styled(StyledCell)`
  display: flex;
  flex-direction: column;
`;

const SoldierNumberInCellWithIcon = styled.span`
  font-size: 15px;
`;
