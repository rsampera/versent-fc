import { HomeView } from "@/components/home-view";
import { getPublicAppData } from "@/lib/supabase-data";

export default async function Home() {
  const { players, lineupVariants } = await getPublicAppData();

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10 xl:px-10">
      <HomeView lineupVariants={lineupVariants} players={players} />
    </main>
  );
}
