"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { PitchBoard, PitchMarker } from "@/components/pitch-board";
import { PlayerCard } from "@/components/player-card";
import {
  LineupVariant,
  Player,
  coverageBiases,
  getPitchJerseySrc,
  positions,
} from "@/lib/site-data";

type PlayerEditorProps = {
  lineupVariants: LineupVariant[];
  player: Player;
  players: Player[];
};

export function PlayerEditor({
  lineupVariants,
  player,
  players,
}: PlayerEditorProps) {
  const router = useRouter();
  const [draft, setDraft] = useState(player.preference);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isEditMode, setIsEditMode] = useState(true);
  const [activeVariantId, setActiveVariantId] = useState(
    lineupVariants.find((variant) => variant.isActive)?.id ?? lineupVariants[0]?.id ?? "",
  );
  const activeVariant =
    lineupVariants.find((variant) => variant.id === activeVariantId) ?? lineupVariants[0];
  const playersById = useMemo(
    () => new Map(players.map((entry) => [entry.id, entry])),
    [players],
  );

  const previewPlayer: Player = {
    ...player,
    preference: draft,
  };

  const activeMarkers: PitchMarker[] = activeVariant.slots.reduce<PitchMarker[]>(
    (markers, slot) => {
      const markerPlayer = playersById.get(slot.playerId);

      if (!markerPlayer) {
        return markers;
      }

      markers.push({
        id: slot.playerId,
        label: markerPlayer.name.split(" ")[0],
        shirtNumber: markerPlayer.shirtNumber,
        jerseySrc: getPitchJerseySrc(markerPlayer),
        x: slot.x,
        y: slot.y,
        accent: slot.playerId === player.id ? "white" : "lime",
      });

      return markers;
    },
    [],
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <section className="space-y-4">
        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,14,11,0.95),rgba(4,8,6,0.94))] px-5 py-4 shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#a6ff47]">
                Player Edit Token
              </p>
              <h1 className="mt-2 text-3xl font-black uppercase tracking-[0.08em] text-white">
                {player.name}
              </h1>
              <p className="mt-2 text-sm text-white/62">
                The field stays central. Edit mode lets you tune ratings, role,
                and preferred coverage without leaving this screen.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {lineupVariants.map((variant) => (
                <button
                  key={variant.id}
                  className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.22em] transition ${
                    variant.id === activeVariant.id
                      ? "border-[#a6ff47]/45 bg-[#a6ff47] text-[#081108]"
                      : "border-white/12 bg-black/20 text-white/72 hover:border-white/25"
                  }`}
                  onClick={() => setActiveVariantId(variant.id)}
                  type="button"
                >
                  {variant.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <PitchBoard
          coverage={{
            x: draft.preferredX,
            y: draft.preferredY,
            width: draft.coverageWidth,
            depth: draft.coverageDepth,
            bias: draft.coverageBias,
          }}
          interactive={isEditMode}
          markers={activeMarkers}
          onMarkerClick={() => {}}
          onPitchClick={(x, y) =>
            isEditMode
              ? setDraft((current) => ({
                  ...current,
                  preferredX: x,
                  preferredY: y,
                }))
              : undefined
          }
          selectedMarkerId={player.id}
          subtitle={
            isEditMode
              ? "Edit mode is on. Click the field to move the preferred anchor point."
              : `${player.name} · preferred coverage highlighted`
          }
          title={activeVariant.label}
        />
      </section>

      <aside className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(9,16,12,0.96),rgba(5,8,6,0.95))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#a6ff47]">
              Selected Player
            </p>
            <p className="mt-2 text-sm text-white/58">
              {isEditMode
                ? "Editing stats, role, and preferred coverage."
                : "Previewing the current player card and preferred zone."}
            </p>
          </div>
          <button
            className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.22em] transition ${
              isEditMode
                ? "border-[#a6ff47]/45 bg-[#a6ff47] text-[#081108]"
                : "border-white/12 bg-black/20 text-white/72 hover:border-white/25"
            }`}
            onClick={() => setIsEditMode((current) => !current)}
            type="button"
          >
            {isEditMode ? "Edit mode" : "Preview"}
          </button>
        </div>

        <div className="mt-4">
          <PlayerCard compact player={previewPlayer} />
        </div>

        <div className="mt-4 rounded-[1.5rem] border border-white/8 bg-black/22 p-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[0.62rem] uppercase tracking-[0.22em] text-white/48">
                Anchor
              </p>
              <p className="mt-1 font-black uppercase tracking-[0.08em] text-white">
                x {draft.preferredX} · y {draft.preferredY}
              </p>
            </div>
            <div>
              <p className="text-[0.62rem] uppercase tracking-[0.22em] text-white/48">
                Bias
              </p>
              <p className="mt-1 font-black uppercase tracking-[0.08em] text-white">
                {draft.coverageBias}
              </p>
            </div>
          </div>
        </div>

        {isEditMode ? (
          <form className="mt-4 space-y-5">
            <div className="grid gap-4">
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

            <div className="grid gap-3">
              {[
                { key: "pace", label: "Pace" },
                { key: "shooting", label: "Shooting" },
                { key: "passing", label: "Passing" },
                { key: "dribbling", label: "Dribbling" },
                { key: "defending", label: "Defending" },
                { key: "physical", label: "Physical" },
              ].map((stat) => (
                <label key={stat.key} className="space-y-2 rounded-[1.25rem] border border-white/8 bg-black/18 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/66">
                      {stat.label}
                    </span>
                    <span className="text-base font-black text-[#dfffbc]">
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

            <div className="grid gap-4">
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
                {saveMessage ?? "Stats, role, and coverage save back to the live squad profile."}
              </p>
            </div>
          </form>
        ) : null}
      </aside>
    </div>
  );
}
