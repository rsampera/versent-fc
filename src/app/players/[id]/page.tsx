import Link from "next/link";
import { notFound } from "next/navigation";

import { PitchBoard } from "@/components/pitch-board";
import { PlayerCard } from "@/components/player-card";
import { getPitchJerseySrc } from "@/lib/site-data";
import { getPlayerById } from "@/lib/supabase-data";

type PlayerDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PlayerDetailPage({ params }: PlayerDetailPageProps) {
  const { id } = await params;
  const player = await getPlayerById(id);

  if (!player) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10 xl:px-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#a6ff47]">
            Player Profile
          </p>
          <h1 className="mt-2 text-3xl font-black uppercase tracking-[0.08em] text-white sm:text-4xl">
            {player.name}
          </h1>
        </div>
        <Link
          className="rounded-full border border-white/12 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-white/82 transition hover:border-white/30 hover:bg-white/5"
          href="/"
        >
          Back to squad
        </Link>
      </div>

      <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <PlayerCard player={player} />
        <PitchBoard
          coverage={{
            x: player.preference.preferredX,
            y: player.preference.preferredY,
            width: player.preference.coverageWidth,
            depth: player.preference.coverageDepth,
            bias: player.preference.coverageBias,
          }}
          markers={[
            {
              id: player.id,
              label: player.name.split(" ")[0],
              shirtNumber: player.shirtNumber,
              jerseySrc: getPitchJerseySrc(player),
              x: player.preference.preferredX,
              y: player.preference.preferredY,
            },
          ]}
          subtitle={`${player.preference.primaryPosition} primary · ${player.preference.secondaryPosition} secondary`}
          title="Preferred Role Map"
          footer={
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.2rem] border border-white/8 bg-black/20 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.22em] text-white/50">
                  Anchor
                </p>
                <p className="mt-1 text-sm font-black uppercase tracking-[0.1em] text-white">
                  x {player.preference.preferredX} · y {player.preference.preferredY}
                </p>
              </div>
              <div className="rounded-[1.2rem] border border-white/8 bg-black/20 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.22em] text-white/50">
                  Width
                </p>
                <p className="mt-1 text-sm font-black uppercase tracking-[0.1em] text-white">
                  {player.preference.coverageWidth}%
                </p>
              </div>
              <div className="rounded-[1.2rem] border border-white/8 bg-black/20 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.22em] text-white/50">
                  Bias
                </p>
                <p className="mt-1 text-sm font-black uppercase tracking-[0.1em] text-white">
                  {player.preference.coverageBias}
                </p>
              </div>
            </div>
          }
        />
      </div>
    </main>
  );
}
