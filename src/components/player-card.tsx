"use client";

import Image from "next/image";
import Link from "next/link";

import { Player, getPlayerProfileSrc, statLabels } from "@/lib/site-data";

type PlayerCardProps = {
  player: Player;
  href?: string;
  compact?: boolean;
};

const statShortLabels: Record<(typeof statLabels)[number], string> = {
  pace: "PAC",
  shooting: "SHO",
  passing: "PAS",
  dribbling: "DRI",
  defending: "DEF",
  physical: "PHY",
};

export function PlayerCard({
  player,
  href,
  compact = false,
}: PlayerCardProps) {
  const heroHeight = compact ? "h-[15.5rem]" : "h-[18.25rem]";
  const lowerHalfTop = compact ? "top-[15.5rem]" : "top-[18.25rem]";

  const card = (
    <article
      className={`group relative w-full max-w-full overflow-hidden rounded-[2.15rem] bg-[radial-gradient(circle_at_55%_14%,rgba(90,140,38,0.34),rgba(12,20,11,0.96)_42%,rgba(3,6,5,1)_100%)] text-white shadow-[0_0_48px_rgba(124,255,71,0.16),0_30px_80px_rgba(0,0,0,0.38)] transition-transform duration-200 ${
        compact ? "h-[33rem]" : "h-[38.5rem]"
      } ${href ? "hover:-translate-y-1" : ""}`}
      style={{ border: "1px solid rgba(255,255,255,0.2)" }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[58%] bg-[linear-gradient(90deg,rgba(5,10,7,0.96),rgba(23,50,12,0.58),rgba(7,14,8,0.28))]" />
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 bg-[#020403] ${lowerHalfTop}`}
      />

      <div className={`relative z-10 overflow-hidden ${heroHeight}`}>
        <div className="absolute inset-x-0 bottom-0 h-px bg-white/7" />
        <div className="absolute left-6 top-6 text-[6rem] font-black leading-none tracking-[-0.08em] text-white sm:text-[6.8rem]">
          {player.shirtNumber}
        </div>
        <div className="absolute left-6 top-4 h-1.5 w-1.5 rounded-full bg-white/8" />
        <div className="absolute bottom-0 left-[28%] right-0 top-1">
          <Image
            alt={`${player.name} profile`}
            className="object-contain object-bottom"
            fill
            priority={false}
            sizes={compact ? "330px" : "460px"}
            src={getPlayerProfileSrc(player)}
          />
        </div>
      </div>

      <div className="relative z-10 bg-[#020403] px-6 pb-7 pt-6">
        <h3 className="text-[2rem] font-black uppercase leading-none tracking-[0.1em] text-white">
          {player.name}
        </h3>
        <p className="mt-3 text-[0.98rem] uppercase tracking-[0.16em] text-white/56">
          {player.preference.primaryPosition} / {player.preference.secondaryPosition}
        </p>

        <div className="mt-6 border-t border-white/6 pt-4" />

        <div className="grid grid-cols-2 gap-x-10 gap-y-5">
          <div className="space-y-5">
            {(["pace", "passing", "defending"] as const).map((label) => (
              <div key={label} className="flex items-center justify-between gap-3">
                <span className="text-[0.98rem] uppercase tracking-[0.32em] text-white/44">
                  {statShortLabels[label]}
                </span>
                <span className="text-[1.18rem] font-black text-[#dcffb1]">
                  {player.preference[label]}
                </span>
              </div>
            ))}
          </div>
          <div className="space-y-5">
            {(["shooting", "dribbling", "physical"] as const).map((label) => (
              <div key={label} className="flex items-center justify-between gap-3">
                <span className="text-[0.98rem] uppercase tracking-[0.32em] text-white/44">
                  {statShortLabels[label]}
                </span>
                <span className="text-[1.18rem] font-black text-[#dcffb1]">
                  {player.preference[label]}
                </span>
              </div>
            ))}
          </div>
        </div>
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
