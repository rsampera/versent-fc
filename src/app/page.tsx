import { HomeView } from "@/components/home-view";
import { getPublicAppData } from "@/lib/supabase-data";

export default async function Home() {
  const { managerToken, players, lineupVariants } = await getPublicAppData();

  return (
    <main className="mx-auto w-full max-w-[76rem] px-5 py-8 sm:px-8 sm:py-10 xl:px-10">
      <HomeView
        lineupVariants={lineupVariants}
        managerToken={managerToken ?? undefined}
        players={players}
      />
    </main>
  );
}
