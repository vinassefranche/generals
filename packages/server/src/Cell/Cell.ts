import { Player, PlayerColor } from "../Player";

export enum CellType {
  Empty = "empty",
  Mountain = "mountain",
  Army = "army",
  EmptyCastle = "emptyCastle",
  OccupiedCastle = "occupiedCastle",
  Crown = "crown",
  Unknown = "unknown",
}

export type Cell =
  | EmptyCell
  | MoutainCell
  | ArmyCell
  | EmptyCastleCell
  | OccupiedCastleCell
  | CrownCell;

export type UnknownCell = {
  readonly type: CellType.Unknown;
};
export const unknownCell: UnknownCell = {
  type: CellType.Unknown,
};

export type EmptyCell = {
  readonly type: CellType.Empty;
};
export const emptyCell: EmptyCell = {
  type: CellType.Empty,
};

export type MoutainCell = {
  readonly type: CellType.Mountain;
};
export const mountainCell: MoutainCell = {
  type: CellType.Mountain,
};

export type ArmyCell = {
  readonly type: CellType.Army;
  readonly color: PlayerColor;
  readonly soldiersNumber: number;
};

export const armyCell = ({
  color,
  soldiersNumber,
}: {
  color: PlayerColor;
  soldiersNumber: number;
}): ArmyCell => ({
  type: CellType.Army,
  color,
  soldiersNumber,
});

export type EmptyCastleCell = {
  readonly type: CellType.EmptyCastle;
};

export const emptyCastleCell: EmptyCastleCell = {
  type: CellType.EmptyCastle,
};

export type OccupiedCastleCell = {
  readonly type: CellType.OccupiedCastle;
  readonly color: PlayerColor | null;
  readonly soldiersNumber: number;
};
export const occupiedCastleCell = (
  props: Omit<OccupiedCastleCell, "type">
): OccupiedCastleCell => ({
  type: CellType.OccupiedCastle,
  ...props,
});

export type CrownCell = {
  readonly type: CellType.Crown;
  readonly color: PlayerColor;
  readonly soldiersNumber: number;
};

export const crownCell = ({
  color,
  soldiersNumber,
}: {
  color: PlayerColor;
  soldiersNumber: number;
}): CrownCell => ({
  type: CellType.Crown,
  color,
  soldiersNumber,
});

export type OccupiedCell = ArmyCell | CrownCell | OccupiedCastleCell;

export type OccupableCell =
  | ArmyCell
  | CrownCell
  | OccupiedCastleCell
  | EmptyCastleCell
  | EmptyCell;

export namespace Cell {
  export const isEmpty = (cell: Cell): cell is EmptyCell | EmptyCastleCell =>
    [CellType.Empty, CellType.EmptyCastle].includes(cell.type);

  export const isOccupable = (cell: Cell): cell is OccupableCell =>
    [
      CellType.Army,
      CellType.OccupiedCastle,
      CellType.EmptyCastle,
      CellType.Crown,
      CellType.Empty,
    ].includes(cell.type);

  export const isOccupied = (cell: Cell): cell is OccupiedCell =>
    [CellType.Army, CellType.OccupiedCastle, CellType.Crown].includes(
      cell.type
    );

  export const belongsToPlayer =
    (player: Player) =>
    (cell: Cell): cell is OccupiedCell =>
      isOccupied(cell) && cell.color === player.color;
}
