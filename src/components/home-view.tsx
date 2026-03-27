"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { PitchBoard, PitchMarker } from "@/components/pitch-board";
import { PlayerCard } from "@/components/player-card";
import { PlayerStrip } from "@/components/player-strip";
import { LineupVariant, Player, getPitchJerseySrc } from "@/lib/site-data";

type HomeViewProps = {
  initialVariant?: string;
  lineupVariants: LineupVariant[];
  managerToken?: string;
  players: Player[];
  showPlayerStrip?: boolean;
};

export function HomeView({
  initialVariant,
  lineupVariants,
  managerToken,
  players,
  showPlayerStrip = true,
}: HomeViewProps) {
  const fallbackVariantId =
    initialVariant ??
    lineupVariants.find((variant) => variant.isActive)?.id ??
    lineupVariants[0]?.id ??
    "";
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const activeVariant =
    lineupVariants.find((variant) => variant.id === fallbackVariantId) ??
    lineupVariants[0];
  const playersById = useMemo(
    () => new Map(players.map((player) => [player.id, player])),
    [players],
  );
  const selectedPlayer = selectedPlayerId
    ? playersById.get(selectedPlayerId) ?? null
    : null;
  const starterIds = new Set(activeVariant.slots.map((slot) => slot.playerId));
  const activeMarkers: PitchMarker[] = activeVariant.slots.reduce<PitchMarker[]>(
    (markers, slot) => {
      const player = playersById.get(slot.playerId);

      if (!player) {
        return markers;
      }

      markers.push({
        id: slot.playerId,
        label: player.name.split(" ")[0],
        shirtNumber: player.shirtNumber,
        jerseySrc: getPitchJerseySrc(player),
        x: slot.x,
        y: slot.y,
        accent: selectedPlayerId === slot.playerId ? "white" : "lime",
      });

      return markers;
    },
    [],
  );

  return (
    <div className="space-y-4">
      <div className="rounded-[1.65rem] bg-[linear-gradient(180deg,rgba(8,14,11,0.95),rgba(4,8,6,0.94))] px-4 py-3 shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="rounded-[1rem] bg-[#09110c] px-3.5 py-2.5">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-[#a6ff47]">
              Club
            </p>
            <h1 className="mt-1 text-xl font-black uppercase tracking-[0.08em] text-white sm:text-2xl">
              VERSENT FC
            </h1>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {selectedPlayer ? (
              <Link
                className="rounded-full border border-white/10 bg-black/18 px-4 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-white/82 transition hover:border-white/22 hover:bg-white/[0.06]"
                href={`/edit/player/${selectedPlayer.editToken}`}
              >
                Edit Player
              </Link>
            ) : null}
            {managerToken ? (
              <Link
                className="rounded-full border border-[#a6ff47]/35 bg-[#a6ff47]/12 px-4 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-[#efffcf] transition hover:border-[#a6ff47]/48 hover:bg-[#a6ff47]/18"
                href={`/manage/${managerToken}`}
              >
                Manager Mode
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_28.5rem] xl:items-start">
        <section className="min-w-0 space-y-3">
          <PitchBoard
            markers={activeMarkers}
            onMarkerClick={(playerId) =>
              setSelectedPlayerId((current) => (current === playerId ? null : playerId))
            }
            selectedMarkerId={selectedPlayerId ?? undefined}
          />
        </section>

        <aside className="min-w-0 rounded-[1.75rem] bg-[#09110c]/85 p-3.5 shadow-[0_24px_80px_rgba(0,0,0,0.32)] xl:sticky xl:top-6 xl:h-fit">
          {selectedPlayer ? (
            <PlayerCard compact player={selectedPlayer} />
          ) : (
            <div className="flex min-h-[28rem] flex-col items-center justify-center rounded-[1.6rem] bg-black/14 px-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#a6ff47]">
                No Player Selected
              </p>
              <h2 className="mt-3 text-2xl font-black uppercase tracking-[0.08em] text-white">
                Choose A Jersey
              </h2>
              <p className="mt-4 max-w-xs text-sm leading-6 text-white/58">
                Click any player on the field to bring their card into focus.
              </p>
            </div>
          )}
        </aside>
      </div>

      {showPlayerStrip ? (
        <PlayerStrip
          activePlayerId={selectedPlayerId}
          onSelect={(playerId) =>
            setSelectedPlayerId((current) => (current === playerId ? null : playerId))
          }
          players={players}
          starterIds={starterIds}
        />
      ) : null}
    </div>
  );
}
