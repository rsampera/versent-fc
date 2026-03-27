import Link from "next/link";
import { notFound } from "next/navigation";

import { ManagerBoard } from "@/components/manager-board";
import {
  getLineupVariants,
  getPlayers,
  validateManagerToken,
} from "@/lib/supabase-data";

type ManagerPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function ManagerPage({ params }: ManagerPageProps) {
  const { token } = await params;
  const isValidManager = await validateManagerToken(token);

  if (!isValidManager) {
    notFound();
  }

  const [players, variants] = await Promise.all([getPlayers(), getLineupVariants()]);

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10 xl:px-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#a6ff47]">
            Manager Route
          </p>
          <h1 className="mt-2 text-3xl font-black uppercase tracking-[0.08em] text-white sm:text-4xl">
            Versent FC Match Board
          </h1>
        </div>
        <Link
          className="rounded-full border border-white/12 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-white/82 transition hover:border-white/30 hover:bg-white/5"
          href="/lineups"
        >
          Public lineup view
        </Link>
      </div>
      <ManagerBoard managerToken={token} players={players} variants={variants} />
    </main>
  );
}
