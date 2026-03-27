"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { PitchBoard } from "@/components/pitch-board";
import { PlayerCard } from "@/components/player-card";
import {
  Player,
  coverageBiases,
  positions,
} from "@/lib/site-data";

type PlayerEditorProps = {
  player: Player;
};

export function PlayerEditor({ player }: PlayerEditorProps) {
  const router = useRouter();
  const [draft, setDraft] = useState(player.preference);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const previewPlayer: Player = {
    ...player,
    preference: draft,
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#a6ff47]">
            Player Edit Token
          </p>
          <h1 className="mt-2 text-3xl font-black uppercase tracking-[0.08em] text-white">
            {player.name}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/68">
            This route is scoped to a single player token. Updates save directly
            to Supabase and refresh the public squad views.
          </p>
        </div>

        <form className="space-y-7">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-white/68">
                Primary position
              </span>
              <select
                className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none transition focus:border-[#a6ff47]/50"
                onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      primaryPosition: event.target.value as (typeof positions)[number],
                    }))
                }
                value={draft.primaryPosition}
              >
                {positions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-white/68">
                Secondary position
              </span>
              <select
                className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none transition focus:border-[#a6ff47]/50"
                onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      secondaryPosition: event.target.value as (typeof positions)[number],
                    }))
                }
                value={draft.secondaryPosition}
              >
                {positions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              { key: "pace", label: "Pace" },
              { key: "shooting", label: "Shooting" },
              { key: "passing", label: "Passing" },
              { key: "dribbling", label: "Dribbling" },
              { key: "defending", label: "Defending" },
              { key: "physical", label: "Physical" },
            ].map((stat) => (
              <label key={stat.key} className="space-y-3 rounded-[1.5rem] border border-white/8 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold uppercase tracking-[0.2em] text-white/76">
                    {stat.label}
                  </span>
                  <span className="text-xl font-black text-[#dfffbc]">
                    {draft[stat.key as keyof typeof draft] as number}
                  </span>
                </div>
                <input
                  className="w-full accent-[#a6ff47]"
                  max={99}
                  min={30}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      [stat.key]: Number(event.target.value),
                    }))
                  }
                  type="range"
                  value={draft[stat.key as keyof typeof draft] as number}
                />
              </label>
            ))}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-white/68">
                Coverage width
              </span>
              <input
                className="w-full accent-[#a6ff47]"
                max={55}
                min={18}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    coverageWidth: Number(event.target.value),
                  }))
                }
                type="range"
                value={draft.coverageWidth}
              />
              <p className="text-sm text-white/62">{draft.coverageWidth}% of pitch width</p>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-white/68">
                Coverage depth
              </span>
              <input
                className="w-full accent-[#a6ff47]"
                max={55}
                min={18}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    coverageDepth: Number(event.target.value),
                  }))
                }
                type="range"
                value={draft.coverageDepth}
              />
              <p className="text-sm text-white/62">{draft.coverageDepth}% of pitch depth</p>
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-white/68">
              Coverage bias
            </span>
            <div className="flex flex-wrap gap-2">
              {coverageBiases.map((option) => (
                <button
                  key={option}
                  className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.22em] transition ${
                    draft.coverageBias === option
                      ? "border-[#a6ff47]/45 bg-[#a6ff47] text-[#081108]"
                      : "border-white/12 bg-black/20 text-white/72 hover:border-white/25"
                  }`}
                  onClick={() =>
                    setDraft((current) => ({ ...current, coverageBias: option }))
                  }
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              className="rounded-full border border-[#a6ff47]/45 bg-[#a6ff47] px-6 py-3 text-sm font-black uppercase tracking-[0.2em] text-[#081108] transition hover:bg-[#baff6c] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  setSaveMessage(null);

                  const response = await fetch(`/api/player/${player.editToken}`, {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      preference: draft,
                    }),
                  });

                  const payload = (await response.json()) as { error?: string };

                  if (!response.ok) {
                    setSaveMessage(payload.error ?? "Unable to save preferences.");
                    return;
                  }

                  setSaveMessage("Preferences saved.");
                  router.refresh();
                });
              }}
              type="button"
            >
              {isPending ? "Saving..." : "Save preferences"}
            </button>
            <p className="text-sm text-white/54">
              {saveMessage ?? "Ratings, positions, and coverage save back to the live squad profile."}
            </p>
          </div>
        </form>
      </section>

      <div className="space-y-8">
        <PitchBoard
          interactive
          coverage={{
            x: draft.preferredX,
            y: draft.preferredY,
            width: draft.coverageWidth,
            depth: draft.coverageDepth,
            bias: draft.coverageBias,
          }}
          markers={[
            {
              id: player.id,
              label: player.name.split(" ")[0],
              shirtNumber: player.shirtNumber,
              x: draft.preferredX,
              y: draft.preferredY,
            },
          ]}
          onPitchClick={(x, y) =>
            setDraft((current) => ({
              ...current,
              preferredX: x,
              preferredY: y,
            }))
          }
          subtitle="Click anywhere on the pitch to move the preferred anchor point."
          title="Preferred Zone"
        />

        <PlayerCard player={previewPlayer} />
      </div>
    </div>
  );
}
