import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import {
  PlayerPreference,
  isCoverageBias,
  isPosition,
} from "@/lib/site-data";
import { getPlayerByToken } from "@/lib/supabase-data";

function getEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function getSupabaseRestBase() {
  return `${getEnv("NEXT_PUBLIC_SUPABASE_URL")}/rest/v1`;
}

function getSupabaseSecretKey() {
  return getEnv("SUPABASE_SECRET_KEY");
}

async function supabaseWrite(path: string, init: RequestInit) {
  const secretKey = getSupabaseSecretKey();
  const response = await fetch(`${getSupabaseRestBase()}${path}`, {
    ...init,
    headers: {
      apikey: secretKey,
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase write failed: ${response.status} ${response.statusText}`);
  }

  return response;
}

function isValidPreference(payload: unknown): payload is PlayerPreference {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as Record<string, unknown>;
  const numberKeys: Array<keyof PlayerPreference> = [
    "pace",
    "shooting",
    "passing",
    "dribbling",
    "defending",
    "physical",
    "preferredX",
    "preferredY",
    "coverageWidth",
    "coverageDepth",
  ];

  return (
    typeof candidate.primaryPosition === "string" &&
    isPosition(candidate.primaryPosition) &&
    typeof candidate.secondaryPosition === "string" &&
    isPosition(candidate.secondaryPosition) &&
    typeof candidate.coverageBias === "string" &&
    isCoverageBias(candidate.coverageBias) &&
    numberKeys.every((key) => {
      const value = candidate[key];
      return typeof value === "number" && Number.isFinite(value);
    })
  );
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await context.params;
    const player = await getPlayerByToken(token);

    if (!player) {
      return NextResponse.json({ error: "Invalid player token." }, { status: 404 });
    }

    const body = await request.json();

    if (!isValidPreference(body.preference)) {
      return NextResponse.json({ error: "Invalid preference payload." }, { status: 400 });
    }

    const preference = body.preference;

    await supabaseWrite(`/player_preferences?player_id=eq.${encodeURIComponent(player.id)}`, {
      method: "PATCH",
      body: JSON.stringify({
        primary_position: preference.primaryPosition,
        secondary_position: preference.secondaryPosition,
        pace: preference.pace,
        shooting: preference.shooting,
        passing: preference.passing,
        dribbling: preference.dribbling,
        defending: preference.defending,
        physical: preference.physical,
        preferred_x: preference.preferredX,
        preferred_y: preference.preferredY,
        coverage_width: preference.coverageWidth,
        coverage_depth: preference.coverageDepth,
        coverage_bias: preference.coverageBias,
        updated_at: new Date().toISOString(),
      }),
    });

    revalidatePath("/");
    revalidatePath("/lineups");
    revalidatePath(`/players/${player.id}`);
    revalidatePath(`/edit/player/${token}`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unexpected player save error.",
      },
      { status: 500 },
    );
  }
}
