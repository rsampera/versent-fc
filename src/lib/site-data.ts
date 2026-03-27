export const positions = [
  "GK",
  "CB",
  "LB",
  "RB",
  "CDM",
  "CM",
  "CAM",
  "LW",
  "RW",
  "ST",
] as const;

export const coverageBiases = ["left", "center", "right"] as const;

export type Position = (typeof positions)[number];
export type CoverageBias = (typeof coverageBiases)[number];

export type PlayerPreference = {
  primaryPosition: Position;
  secondaryPosition: Position;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  preferredX: number;
  preferredY: number;
  coverageWidth: number;
  coverageDepth: number;
  coverageBias: CoverageBias;
};

export type Player = {
  id: string;
  name: string;
  shirtNumber: number;
  editToken: string;
  cardImageUrl?: string | null;
  preference: PlayerPreference;
};

export type LineupSlot = {
  playerId: string;
  x: number;
  y: number;
};

export type LineupVariant = {
  id: string;
  name: string;
  label: string;
  description: string;
  isActive: boolean;
  slots: LineupSlot[];
};

export const statLabels: Array<
  keyof Omit<
    PlayerPreference,
    | "primaryPosition"
    | "secondaryPosition"
    | "preferredX"
    | "preferredY"
    | "coverageWidth"
    | "coverageDepth"
    | "coverageBias"
  >
> = ["pace", "shooting", "passing", "dribbling", "defending", "physical"];

export function getOverallRating(preference: PlayerPreference) {
  const weightedTotal =
    preference.pace * 0.16 +
    preference.shooting * 0.14 +
    preference.passing * 0.2 +
    preference.dribbling * 0.18 +
    preference.defending * 0.16 +
    preference.physical * 0.16;

  return Math.round(weightedTotal);
}

export function isPosition(value: string): value is Position {
  return positions.includes(value as Position);
}

export function isCoverageBias(value: string): value is CoverageBias {
  return coverageBiases.includes(value as CoverageBias);
}
