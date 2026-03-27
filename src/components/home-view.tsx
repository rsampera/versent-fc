"use client";

import Link from "next/link";
import { useState } from "react";

import { PitchBoard, PitchMarker } from "@/components/pitch-board";
import { PlayerCard } from "@/components/player-card";
import { LineupVariant, Player } from "@/lib/site-data";

type HomeViewProps = {
  initialVariant?: string;
  lineupVariants: LineupVariant[];
  players: Player[];
};

export function HomeView({
  initialVariant,
  lineupVariants,
  players,
}: HomeViewProps) {
  const fallbackVariantId =
    initialVariant ??
    lineupVariants.find((variant) => variant.isActive)?.id ??
    lineupVariants[0]?.id ??
    "";
  const [activeVariantId, setActiveVariantId] = useState(fallbackVariantId);
  const activeVariant =
    lineupVariants.find((variant) => variant.id === activeVariantId) ??
    lineupVariants.find((variant) => variant.id === fallbackVariantId) ??
    lineupVariants[0];
  const playersById = new Map(players.map((player) => [player.id, player]));
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
        x: slot.x,
        y: slot.y,
        accent: "lime",
      });

      return markers;
    },
    [],
  );

  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(166,255,71,0.16),rgba(7,8,8,0.98)_38%,rgba(14,20,14,0.98)_100%)] p-8 shadow-[0_40px_120px_rgba(0,0,0,0.38)]">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.5em] text-[#a6ff47]">
                Two-Day Squad Companion
              </p>
              <h1 className="mt-4 text-4xl font-black uppercase leading-none tracking-[0.08em] text-white sm:text-6xl">
                Build The Team
                <span className="mt-2 block text-[#baff6c]">Before Kick-Off</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/72">
                A FIFA-style squad app for one Versent FC tournament run. Players
                self-rate attributes, stake out their preferred zone, and the
                manager shapes a starting eight across saved lineup variants.
              </p>
            </div>
            <div className="rounded-[2rem] border border-[#a6ff47]/25 bg-black/25 px-5 py-4 text-right">
              <p className="text-xs uppercase tracking-[0.3em] text-white/55">
                Squad Size
              </p>
              <p className="mt-1 text-4xl font-black text-white">{players.length}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.24em] text-[#dfffbc]">
                8 on field
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="rounded-full border border-[#a6ff47]/45 bg-[#a6ff47] px-6 py-3 text-sm font-black uppercase tracking-[0.2em] text-[#081108] transition hover:bg-[#baff6c]"
              href="/lineups"
            >
              View lineups
            </Link>
          </div>
        </div>

        <PitchBoard
          title={activeVariant.label}
          subtitle={activeVariant.description}
          markers={activeMarkers}
          footer={
            <div className="space-y-4">
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
              <p className="text-sm text-white/62">
                Players own their preferred position profile. The manager owns the
                actual lineup variants.
              </p>
            </div>
          }
        />
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#a6ff47]">
              Squad Cards
            </p>
            <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.1em] text-white">
              Self-Rated FIFA Profiles
            </h2>
          </div>
          <Link
            className="text-sm font-semibold uppercase tracking-[0.2em] text-white/65 transition hover:text-white"
            href="/lineups"
          >
            See full board
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              compact
              href={`/players/${player.id}`}
              player={player}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
