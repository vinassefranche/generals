enum CellType {
  Empty = "empty",
  Mountain = "mountain",
  Army = "army",
  Castle = "castle",
  Crown = "crown",
}

type Color = "blue" | "red" | "yellow" | "green";

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
  readonly color: Color;
  readonly soldiersNumber: number;
};

export const armyCell = ({
  color,
  soldiersNumber,
}: {
  color: Color;
  soldiersNumber: number;
}): ArmyCell => ({
  type: CellType.Army,
  color,
  soldiersNumber,
});

export type CastleCell = {
  readonly type: CellType.Castle;
  readonly color: Color;
  readonly soldiersNumber: number;
};

export const castleCell = ({
  color,
  soldiersNumber,
}: {
  color: Color;
  soldiersNumber: number;
}): CastleCell => ({
  type: CellType.Castle,
  color,
  soldiersNumber,
});

export type CrownCell = {
  readonly type: CellType.Crown;
  readonly color: Color;
  readonly soldiersNumber: number;
};

export const crownCell = ({
  color,
  soldiersNumber,
}: {
  color: Color;
  soldiersNumber: number;
}): CrownCell => ({
  type: CellType.Crown,
  color,
  soldiersNumber,
});
