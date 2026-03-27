import { redirect } from "next/navigation";

type ManagerPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function ManagerPage({ params }: ManagerPageProps) {
  await params;
  redirect("/");
}
