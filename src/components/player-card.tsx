"use client";

import Link from "next/link";

import {
  Player,
  getOverallRating,
  statLabels,
} from "@/lib/site-data";

type PlayerCardProps = {
  player: Player;
  href?: string;
  compact?: boolean;
};

export function PlayerCard({
  player,
  href,
  compact = false,
}: PlayerCardProps) {
  const overall = getOverallRating(player.preference);
  const card = (
    <article
      className={`group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(166,255,71,0.22),_rgba(7,10,8,0.98)_48%)] p-5 text-white shadow-[0_30px_80px_rgba(0,0,0,0.35)] transition-transform duration-200 ${
        compact ? "min-h-[320px]" : "min-h-[410px]"
      } ${href ? "hover:-translate-y-1" : ""}`}
    >
      <div className="absolute inset-x-5 top-4 h-px bg-gradient-to-r from-transparent via-[#a6ff47] to-transparent opacity-80" />
      <div className="absolute inset-y-6 left-4 w-px bg-gradient-to-b from-transparent via-white/15 to-transparent" />
      <div className="absolute inset-y-6 right-4 w-px bg-gradient-to-b from-transparent via-white/15 to-transparent" />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.45em] text-[#a6ff47]">
            Versent FC
          </p>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-6xl font-black leading-none">{overall}</span>
            <div className="space-y-1 text-xs uppercase tracking-[0.28em] text-white/70">
              <p>{player.preference.primaryPosition}</p>
              <p>{player.preference.secondaryPosition}</p>
            </div>
          </div>
        </div>
        <div className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/75">
          #{player.shirtNumber}
        </div>
      </div>

      <div className="mt-6 flex h-36 items-end justify-center rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.01))]">
        <div className="relative h-28 w-24">
          <div
            className="absolute inset-0 border border-[#a6ff47]/70 bg-[#050705] shadow-[0_0_30px_rgba(166,255,71,0.25)]"
            style={{
              clipPath:
                "polygon(22% 0%, 78% 0%, 88% 15%, 100% 20%, 88% 100%, 12% 100%, 0% 20%, 12% 15%)",
            }}
          />
          <div className="absolute inset-x-[18%] top-[8%] h-[8%] rounded-full border border-[#a6ff47]/75 bg-transparent" />
          <div className="absolute inset-x-0 top-[16%] h-[6%] bg-[#a6ff47]/85" />
          <div className="absolute inset-y-0 left-0 w-[8%] bg-[#a6ff47]/85" />
          <div className="absolute inset-y-0 right-0 w-[8%] bg-[#a6ff47]/85" />
          <div className="absolute inset-x-[22%] bottom-[34%] text-center text-[1.55rem] font-black leading-none text-white">
            {player.shirtNumber}
          </div>
          <div className="absolute inset-x-[12%] bottom-[14%] text-center text-[0.52rem] font-semibold uppercase tracking-[0.24em] text-[#d6ffa8]">
            {player.name.split(" ")[0]}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <h3 className="text-xl font-black uppercase tracking-[0.12em]">
          {player.name}
        </h3>
        <p className="mt-1 text-xs uppercase tracking-[0.28em] text-white/60">
          Preferred zones and self-rated style
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-2 text-sm">
        {statLabels.map((label) => (
          <div key={label} className="flex items-center justify-between gap-3">
            <span className="uppercase tracking-[0.2em] text-white/65">
              {label.slice(0, 3)}
            </span>
            <span className="font-bold text-[#dfffbc]">
              {player.preference[label]}
            </span>
          </div>
        ))}
      </div>
    </article>
  );

  if (!href) {
    return card;
  }

  return (
    <Link className="block" href={href}>
      {card}
    </Link>
  );
}
