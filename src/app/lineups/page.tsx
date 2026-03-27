import Link from "next/link";

import { HomeView } from "@/components/home-view";
import { getPublicAppData } from "@/lib/supabase-data";

export default async function LineupsPage() {
  const { players, lineupVariants } = await getPublicAppData();

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10 xl:px-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#a6ff47]">
            Lineup Variants
          </p>
          <h1 className="mt-2 text-3xl font-black uppercase tracking-[0.08em] text-white sm:text-4xl">
            Starting Eight Boards
          </h1>
        </div>
        <Link
          className="rounded-full border border-white/12 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-white/82 transition hover:border-white/30 hover:bg-white/5"
          href="/"
        >
          Back to squad
        </Link>
      </div>

      <HomeView
        initialVariant={lineupVariants.find((variant) => variant.isActive)?.id}
        lineupVariants={lineupVariants}
        players={players}
      />
    </main>
  );
}
