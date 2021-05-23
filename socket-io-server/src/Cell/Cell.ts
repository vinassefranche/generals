import { Player, PlayerColor } from "../Player";

export enum CellType {
  Empty = "empty",
  Mountain = "mountain",
  Army = "army",
  Castle = "castle",
  Crown = "crown",
}

export type Cell = EmptyCell | MoutainCell | ArmyCell | CastleCell | CrownCell;

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

export type CastleCell = {
  readonly type: CellType.Castle;
  readonly color?: PlayerColor;
  readonly soldiersNumber?: number;
};

export const castleCell = ({
  color,
  soldiersNumber,
}: {
  color: PlayerColor;
  soldiersNumber: number;
}): CastleCell => ({
  type: CellType.Castle,
  color,
  soldiersNumber,
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

type OccupableCell = ArmyCell | CrownCell | CastleCell;
const isOccupableCell = (cell: Cell): cell is OccupableCell =>
  [CellType.Army, CellType.Castle, CellType.Crown].includes(cell.type);

export const cellBelongsToPlayer = (player: Player) => (cell: Cell) =>
  isOccupableCell(cell) && cell.color === player.color;
