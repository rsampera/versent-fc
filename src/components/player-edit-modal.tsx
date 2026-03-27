"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Player, PlayerPreference, positions } from "@/lib/site-data";
import { PlayerCard } from "@/components/player-card";

type PlayerEditModalProps = {
  isPending?: boolean;
  onClose: () => void;
  onSave: (preference: PlayerPreference) => void;
  player: Player;
  saveMessage?: string | null;
};

const statControls = [
  { key: "pace", label: "Pace" },
  { key: "shooting", label: "Shooting" },
  { key: "passing", label: "Passing" },
  { key: "dribbling", label: "Dribbling" },
  { key: "defending", label: "Defending" },
  { key: "physical", label: "Physical" },
] as const;

export function PlayerEditModal({
  isPending = false,
  onClose,
  onSave,
  player,
  saveMessage,
}: PlayerEditModalProps) {
  const [draft, setDraft] = useState(player.preference);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDraft(player.preference);
  }, [player]);

  useEffect(() => {
    setMounted(true);

    return () => setMounted(false);
  }, []);

  const previewPlayer: Player = {
    ...player,
    preference: draft,
  };

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/72 px-4 py-5 backdrop-blur-sm sm:py-8">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 mt-2 w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,16,12,0.98),rgba(4,7,5,0.98))] shadow-[0_40px_120px_rgba(0,0,0,0.5)] sm:mt-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/8 px-5 py-4 sm:px-6">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-[#a6ff47]">
              Edit Player
            </p>
            <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.08em] text-white">
              {player.name}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              className="rounded-full border border-white/10 bg-black/18 px-4 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-white/78 transition hover:border-white/20 hover:bg-white/[0.05]"
              onClick={onClose}
              type="button"
            >
              Close
            </button>
            <button
              className="rounded-full border border-[#a6ff47]/42 bg-[#a6ff47] px-4 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-[#081108] transition hover:bg-[#baff6c] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isPending}
              onClick={() => onSave(draft)}
              type="button"
            >
              {isPending ? "Saving..." : "Save Player"}
            </button>
          </div>
        </div>

        <div className="grid gap-6 px-5 py-5 sm:px-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
          <div className="min-w-0">
            <PlayerCard compact player={previewPlayer} />
            <p className="mt-3 text-sm text-white/55">
              {saveMessage ?? "Adjust positions and self-rated attributes, then save."}
            </p>
          </div>

          <form className="min-w-0 space-y-5" onSubmit={(event) => event.preventDefault()}>
            <div className="grid gap-4 sm:grid-cols-2">
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

            <div className="grid gap-3 sm:grid-cols-2">
              {statControls.map((stat) => (
                <label
                  key={stat.key}
                  className="space-y-2 rounded-[1.25rem] border border-white/8 bg-black/18 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/66">
                      {stat.label}
                    </span>
                    <span className="text-base font-black text-[#dfffbc]">
                      {draft[stat.key]}
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
                    value={draft[stat.key]}
                  />
                </label>
              ))}
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
