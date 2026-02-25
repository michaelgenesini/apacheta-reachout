import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MONTHLY_LIMIT, type Profile } from "@/lib/types";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/auth");
  }

  return <DashboardClient profile={profile as Profile} monthlyLimit={MONTHLY_LIMIT} />;
}
