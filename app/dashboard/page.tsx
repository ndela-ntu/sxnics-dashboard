import EpisodeVsPlayChart from "@/components/ui/dashboard/episode-vs-play-chart";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="border-t border-white my-1" />
      <div className="grid grid-cols-1 md:grid-cols-2">
        <EpisodeVsPlayChart />
      </div>
    </div>
  );
}
