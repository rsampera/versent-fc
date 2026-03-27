"use client";

import { Player } from "@/lib/site-data";

type PlayerStripProps = {
  activePlayerId?: string | null;
  players: Player[];
  starterIds: Set<string>;
  onSelect: (playerId: string) => void;
};

export function PlayerStrip({
  activePlayerId,
  players,
  starterIds,
  onSelect,
}: PlayerStripProps) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-2.5 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
      <div className="mb-2 flex items-center justify-between gap-4 px-1.5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a6ff47]">
            Squad Strip
          </p>
          <p className="mt-1 text-xs text-white/58 sm:text-sm">
            Select a player to reveal their card.
          </p>
        </div>
      </div>

      <div className="flex gap-2.5 overflow-x-auto px-1 pb-1">
        {players.map((player) => {
          const isActive = activePlayerId === player.id;
          const isStarter = starterIds.has(player.id);

          return (
            <button
              key={player.id}
              className={`min-w-[124px] rounded-[1.15rem] border px-3 py-2.5 text-left transition ${
                isActive
                  ? "border-[#a6ff47]/45 bg-[#a6ff47]/14"
                  : "border-white/10 bg-white/[0.04] hover:border-white/25"
              }`}
              onClick={() => onSelect(player.id)}
              type="button"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-base font-black text-white">#{player.shirtNumber}</span>
                <span
                  className={`rounded-full px-2 py-1 text-[0.58rem] font-black uppercase tracking-[0.18em] ${
                    isStarter
                      ? "bg-[#a6ff47]/18 text-[#dfffbc]"
                      : "bg-white/8 text-white/58"
                  }`}
                >
                  {isStarter ? "Starter" : "Bench"}
                </span>
              </div>
              <p className="mt-2 text-sm font-black uppercase tracking-[0.08em] text-white">
                {player.name}
              </p>
              <p className="mt-1 text-[0.68rem] uppercase tracking-[0.24em] text-white/52">
                {player.preference.primaryPosition} / {player.preference.secondaryPosition}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
