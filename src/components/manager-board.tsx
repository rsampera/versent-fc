"use client";

import { useMemo, useState, useTransition } from "react";

import { PitchBoard } from "@/components/pitch-board";
import { LineupVariant, Player, getPitchJerseySrc } from "@/lib/site-data";

type ManagerBoardProps = {
  managerToken: string;
  players: Player[];
  variants: LineupVariant[];
};

export function ManagerBoard({
  managerToken,
  players,
  variants,
}: ManagerBoardProps) {
  const [draftVariants, setDraftVariants] = useState(variants);
  const [activeVariantId, setActiveVariantId] = useState(variants[0]?.id ?? "");
  const [selectedPlayerId, setSelectedPlayerId] = useState(
    variants[0]?.slots[0]?.playerId ?? players[0]?.id ?? "",
  );
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPending, startTransition] = useTransition();
  const playersById = useMemo(
    () => new Map(players.map((player) => [player.id, player])),
    [players],
  );

  const activeVariant =
    draftVariants.find((variant) => variant.id === activeVariantId) ?? draftVariants[0];
  const selectedPlayer = playersById.get(selectedPlayerId);
  const starters = new Set(activeVariant.slots.map((slot) => slot.playerId));

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-[1.75rem] bg-[#09110c]/85 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#a6ff47]">
            Manager Token
          </p>
          <h1 className="mt-2 text-3xl font-black uppercase tracking-[0.08em] text-white">
            Lineup Variants
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/68">
            This board controls the real 8-player setup, separate from each
            player&apos;s self-declared preferred zone.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.26em] text-white/55">
              Active variant
            </p>
            <div className="flex flex-wrap gap-2">
              {draftVariants.map((variant) => (
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

          <div className="rounded-[1.6rem] bg-black/20 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/55">
              Bench / Available squad
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {players.map((player) => {
                const isStarter = starters.has(player.id);
                const isSelected = selectedPlayerId === player.id;

                return (
                  <button
                    key={player.id}
                    className={`rounded-[1.25rem] border px-4 py-3 text-left transition ${
                      isSelected
                        ? "border-[#a6ff47]/45 bg-[#a6ff47]/16"
                        : "border-white/10 bg-white/[0.03] hover:border-white/25"
                    }`}
                    onClick={() => setSelectedPlayerId(player.id)}
                    type="button"
                  >
                    <p className="text-sm font-black uppercase tracking-[0.12em] text-white">
                      {player.name}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.22em] text-white/55">
                      #{player.shirtNumber} · {player.preference.primaryPosition}
                    </p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#dfffbc]">
                      {isStarter ? "In current variant" : "Available"}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[1.6rem] bg-black/20 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/55">
              Selected player
            </p>
            {selectedPlayer ? (
              <div className="mt-4">
                <p className="text-xl font-black uppercase tracking-[0.1em] text-white">
                  {selectedPlayer.name}
                </p>
                <p className="mt-2 text-sm text-white/62">
                  {isEditMode
                    ? "Edit mode is on. Click the pitch to place this player in the active variant."
                    : "Edit mode is off. Turn it on to reposition players on the pitch."}
                </p>
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                className={`rounded-full border px-5 py-3 text-sm font-black uppercase tracking-[0.2em] transition ${
                  isEditMode
                    ? "border-[#a6ff47]/45 bg-[#a6ff47] text-[#081108]"
                    : "border-white/12 bg-black/20 text-white/72 hover:border-white/25"
                }`}
                onClick={() => setIsEditMode((current) => !current)}
                type="button"
              >
                {isEditMode ? "Edit mode on" : "Edit mode off"}
              </button>
              <button
                className="rounded-full border border-[#a6ff47]/45 bg-[#a6ff47] px-6 py-3 text-sm font-black uppercase tracking-[0.2em] text-[#081108] transition hover:bg-[#baff6c] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isPending}
                onClick={() => {
                  startTransition(async () => {
                    setSaveMessage(null);

                    const response = await fetch(
                      `/api/manage/${managerToken}/lineups/${activeVariant.id}`,
                      {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          slots: activeVariant.slots,
                        }),
                      },
                    );

                    const payload = (await response.json()) as { error?: string };

                    if (!response.ok) {
                      setSaveMessage(payload.error ?? "Unable to save variant.");
                      return;
                    }

                    setSaveMessage(`Saved ${activeVariant.name}.`);
                  });
                }}
                type="button"
              >
                {isPending ? "Saving..." : "Save variant"}
              </button>
              <p className="text-sm text-white/54">
                {saveMessage ?? "Tap the pitch to move the selected player, then save the active variant."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <PitchBoard
        interactive={Boolean(selectedPlayer) && isEditMode}
        markers={activeVariant.slots.map((slot) => {
          const player = playersById.get(slot.playerId);

          return {
            id: slot.playerId,
            label: player?.name.split(" ")[0] ?? "Player",
            shirtNumber: player?.shirtNumber,
            jerseySrc: player ? getPitchJerseySrc(player) : "/jersey.png",
            x: slot.x,
            y: slot.y,
            accent: selectedPlayerId === slot.playerId ? ("white" as const) : ("lime" as const),
          };
        })}
        onPitchClick={(x, y) => {
          if (!selectedPlayerId || !isEditMode) {
            return;
          }

          setDraftVariants((current) =>
            current.map((variant) => {
              if (variant.id !== activeVariant.id) {
                return variant;
              }

              const existingIndex = variant.slots.findIndex(
                (slot) => slot.playerId === selectedPlayerId,
              );

              if (existingIndex >= 0) {
                return {
                  ...variant,
                  slots: variant.slots.map((slot, index) =>
                    index === existingIndex ? { ...slot, x, y } : slot,
                  ),
                };
              }

              const replacementIndex =
                variant.slots.length >= 8 ? variant.slots.length - 1 : -1;

              return {
                ...variant,
                slots:
                  replacementIndex >= 0
                    ? variant.slots.map((slot, index) =>
                        index === replacementIndex
                          ? { playerId: selectedPlayerId, x, y }
                          : slot,
                      )
                    : [...variant.slots, { playerId: selectedPlayerId, x, y }],
              };
            }),
          );
          setSaveMessage(`Moved ${selectedPlayer?.name ?? "player"} in ${activeVariant.name}. Save to persist.`);
        }}
        subtitle={`${activeVariant.label} · ${activeVariant.description}`}
        title="Starting Eight Layout"
        footer={
          <div className="grid gap-3 sm:grid-cols-2">
            {activeVariant.slots.map((slot) => {
              const player = playersById.get(slot.playerId);

              if (!player) {
                return null;
              }

              return (
                <div
                  key={slot.playerId}
                  className="rounded-[1.2rem] border border-white/8 bg-black/20 px-4 py-3"
                >
                  <p className="text-sm font-black uppercase tracking-[0.1em] text-white">
                    {player.name}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/55">
                    {player.preference.primaryPosition} · x {slot.x} · y {slot.y}
                  </p>
                </div>
              );
            })}
          </div>
        }
      />
    </div>
  );
}
