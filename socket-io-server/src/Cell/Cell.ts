import { Player, PlayerColor } from "../Player";

export enum CellType {
  Empty = "empty",
  Mountain = "mountain",
  Army = "army",
  EmptyCastle = "emptyCastle",
  OccupiedCastle = "occupiedCastle",
  Crown = "crown",
}

export type Cell =
  | EmptyCell
  | MoutainCell
  | ArmyCell
  | EmptyCastleCell
  | OccupiedCastleCell
  | CrownCell;

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
  readonly color: PlayerColor;
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

type OccupableCell = ArmyCell | CrownCell | OccupiedCastleCell;
const isOccupableCell = (cell: Cell): cell is OccupableCell =>
  [CellType.Army, CellType.OccupiedCastle, CellType.Crown].includes(cell.type);

export const cellBelongsToPlayer = (player: Player) => (cell: Cell) =>
  isOccupableCell(cell) && cell.color === player.color;
