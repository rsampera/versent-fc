import Link from "next/link";
import { notFound } from "next/navigation";

import { PlayerEditor } from "@/components/player-editor";
import { getPlayerByToken, getPublicAppData } from "@/lib/supabase-data";

type PlayerEditPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function PlayerEditPage({ params }: PlayerEditPageProps) {
  const { token } = await params;
  const [player, publicData] = await Promise.all([
    getPlayerByToken(token),
    getPublicAppData(),
  ]);

  if (!player) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10 xl:px-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link
          className="rounded-full border border-white/12 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-white/82 transition hover:border-white/30 hover:bg-white/5"
          href={`/players/${player.id}`}
        >
          View player profile
        </Link>
      </div>
      <PlayerEditor
        lineupVariants={publicData.lineupVariants}
        player={player}
        players={publicData.players}
      />
    </main>
  );
}
