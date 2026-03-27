import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { validateManagerToken } from "@/lib/supabase-data";

type SlotPayload = {
  playerId: string;
  x: number;
  y: number;
};

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

function isValidSlots(payload: unknown): payload is SlotPayload[] {
  if (!Array.isArray(payload) || payload.length === 0 || payload.length > 8) {
    return false;
  }

  const ids = new Set<string>();

  return payload.every((slot) => {
    if (
      !slot ||
      typeof slot !== "object" ||
      typeof (slot as SlotPayload).playerId !== "string" ||
      typeof (slot as SlotPayload).x !== "number" ||
      typeof (slot as SlotPayload).y !== "number"
    ) {
      return false;
    }

    const { playerId, x, y } = slot as SlotPayload;

    if (ids.has(playerId)) {
      return false;
    }

    ids.add(playerId);

    return (
      Number.isFinite(x) &&
      Number.isFinite(y) &&
      x >= 0 &&
      x <= 100 &&
      y >= 0 &&
      y <= 100
    );
  });
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ token: string; variantId: string }> },
) {
  try {
    const { token, variantId } = await context.params;
    const isValidManager = await validateManagerToken(token);

    if (!isValidManager) {
      return NextResponse.json({ error: "Invalid manager token." }, { status: 404 });
    }

    const body = await request.json();

    if (!isValidSlots(body.slots)) {
      return NextResponse.json({ error: "Invalid lineup slot payload." }, { status: 400 });
    }

    const slots: SlotPayload[] = body.slots;

    await supabaseWrite(
      `/lineup_slots?lineup_variant_id=eq.${encodeURIComponent(variantId)}`,
      { method: "DELETE" },
    );

    await supabaseWrite("/lineup_slots", {
      method: "POST",
      body: JSON.stringify(
        slots.map((slot) => ({
          lineup_variant_id: variantId,
          player_id: slot.playerId,
          slot_x: Math.round(slot.x),
          slot_y: Math.round(slot.y),
        })),
      ),
    });

    revalidatePath("/");
    revalidatePath("/lineups");
    revalidatePath(`/manage/${token}`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unexpected lineup save error.",
      },
      { status: 500 },
    );
  }
}
