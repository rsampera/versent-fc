import { redirect } from "next/navigation";

type PlayerEditPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function PlayerEditPage({ params }: PlayerEditPageProps) {
  await params;
  redirect("/");
}
