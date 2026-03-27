import "server-only";

import {
  CoverageBias,
  LineupSlot,
  LineupVariant,
  Player,
  PlayerPreference,
  Position,
  isCoverageBias,
  isPosition,
} from "@/lib/site-data";

type PlayerRow = {
  id: string;
  name: string;
  shirt_number: number;
  card_image_url: string | null;
  player_edit_token: string;
};

type PreferenceRow = {
  player_id: string;
  primary_position: string;
  secondary_position: string;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  preferred_x: number;
  preferred_y: number;
  coverage_width: number;
  coverage_depth: number;
  coverage_bias: string;
};

type VariantRow = {
  id: string;
  name: string;
  label: string;
  description: string;
  sort_order: number;
  is_active: boolean;
};

type SlotRow = {
  lineup_variant_id: string;
  player_id: string;
  slot_x: number;
  slot_y: number;
};

type AppSettingsRow = {
  manager_token: string;
};

function getEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function getSupabaseRestBase() {
  const url = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  return `${url}/rest/v1`;
}

function getSupabaseSecretKey() {
  return getEnv("SUPABASE_SECRET_KEY");
}

async function supabaseRequest<T>(path: string, init: RequestInit = {}) {
  const secretKey = getSupabaseSecretKey();
  const response = await fetch(`${getSupabaseRestBase()}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: secretKey,
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase request failed: ${response.status} ${response.statusText}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

function mapPreference(row: PreferenceRow): PlayerPreference {
  if (!isPosition(row.primary_position) || !isPosition(row.secondary_position)) {
    throw new Error(`Invalid position data for player ${row.player_id}`);
  }

  if (!isCoverageBias(row.coverage_bias)) {
    throw new Error(`Invalid coverage bias for player ${row.player_id}`);
  }

  return {
    primaryPosition: row.primary_position as Position,
    secondaryPosition: row.secondary_position as Position,
    pace: row.pace,
    shooting: row.shooting,
    passing: row.passing,
    dribbling: row.dribbling,
    defending: row.defending,
    physical: row.physical,
    preferredX: row.preferred_x,
    preferredY: row.preferred_y,
    coverageWidth: row.coverage_width,
    coverageDepth: row.coverage_depth,
    coverageBias: row.coverage_bias as CoverageBias,
  };
}

function mapPlayer(row: PlayerRow, preference: PreferenceRow): Player {
  return {
    id: row.id,
    name: row.name,
    shirtNumber: row.shirt_number,
    cardImageUrl: row.card_image_url,
    editToken: row.player_edit_token,
    preference: mapPreference(preference),
  };
}

function mapSlot(row: SlotRow): LineupSlot {
  return {
    playerId: row.player_id,
    x: row.slot_x,
    y: row.slot_y,
  };
}

function mapVariant(row: VariantRow, slots: SlotRow[]): LineupVariant {
  return {
    id: row.id,
    name: row.name,
    label: row.label,
    description: row.description,
    isActive: row.is_active,
    slots: slots.map(mapSlot),
  };
}

async function listPlayerRows() {
  return supabaseRequest<PlayerRow[]>(
    "/players?select=id,name,shirt_number,card_image_url,player_edit_token&order=shirt_number.asc",
  );
}

async function listPreferenceRows() {
  return supabaseRequest<PreferenceRow[]>(
    "/player_preferences?select=player_id,primary_position,secondary_position,pace,shooting,passing,dribbling,defending,physical,preferred_x,preferred_y,coverage_width,coverage_depth,coverage_bias",
  );
}

export async function getPlayers() {
  const [playerRows, preferenceRows] = await Promise.all([
    listPlayerRows(),
    listPreferenceRows(),
  ]);

  const preferencesByPlayer = new Map(
    preferenceRows.map((row) => [row.player_id, row]),
  );

  return playerRows
    .map((row) => {
      const preference = preferencesByPlayer.get(row.id);
      return preference ? mapPlayer(row, preference) : null;
    })
    .filter((player): player is Player => Boolean(player));
}

export async function getPlayerById(id: string) {
  const [playerRows, preferenceRows] = await Promise.all([
    supabaseRequest<PlayerRow[]>(
      `/players?select=id,name,shirt_number,card_image_url,player_edit_token&id=eq.${encodeURIComponent(id)}`,
    ),
    supabaseRequest<PreferenceRow[]>(
      `/player_preferences?select=player_id,primary_position,secondary_position,pace,shooting,passing,dribbling,defending,physical,preferred_x,preferred_y,coverage_width,coverage_depth,coverage_bias&player_id=eq.${encodeURIComponent(id)}`,
    ),
  ]);

  const playerRow = playerRows[0];
  const preferenceRow = preferenceRows[0];

  if (!playerRow || !preferenceRow) {
    return null;
  }

  return mapPlayer(playerRow, preferenceRow);
}

export async function getPlayerByToken(token: string) {
  const playerRows = await supabaseRequest<PlayerRow[]>(
    `/players?select=id,name,shirt_number,card_image_url,player_edit_token&player_edit_token=eq.${encodeURIComponent(token)}`,
  );
  const playerRow = playerRows[0];

  if (!playerRow) {
    return null;
  }

  const preferenceRows = await supabaseRequest<PreferenceRow[]>(
    `/player_preferences?select=player_id,primary_position,secondary_position,pace,shooting,passing,dribbling,defending,physical,preferred_x,preferred_y,coverage_width,coverage_depth,coverage_bias&player_id=eq.${encodeURIComponent(playerRow.id)}`,
  );
  const preferenceRow = preferenceRows[0];

  if (!preferenceRow) {
    return null;
  }

  return mapPlayer(playerRow, preferenceRow);
}

export async function getLineupVariants() {
  const [variantRows, slotRows] = await Promise.all([
    supabaseRequest<VariantRow[]>(
      "/lineup_variants?select=id,name,label,description,sort_order,is_active&order=sort_order.asc",
    ),
    supabaseRequest<SlotRow[]>(
      "/lineup_slots?select=lineup_variant_id,player_id,slot_x,slot_y&order=id.asc",
    ),
  ]);

  const slotsByVariant = new Map<string, SlotRow[]>();

  for (const slot of slotRows) {
    const current = slotsByVariant.get(slot.lineup_variant_id) ?? [];
    current.push(slot);
    slotsByVariant.set(slot.lineup_variant_id, current);
  }

  return variantRows.map((row) => mapVariant(row, slotsByVariant.get(row.id) ?? []));
}

export async function getPublicAppData() {
  const [players, lineupVariants] = await Promise.all([
    getPlayers(),
    getLineupVariants(),
  ]);

  return {
    players,
    lineupVariants,
  };
}

export async function validateManagerToken(token: string) {
  const rows = await supabaseRequest<AppSettingsRow[]>(
    `/app_settings?select=manager_token&id=eq.1&manager_token=eq.${encodeURIComponent(token)}`,
  );

  return rows.length > 0;
}
