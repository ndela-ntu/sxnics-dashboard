import ReleaseCard from "@/components/ui/release-radar/release-card";
import TopPickCard from "@/components/ui/top-picks/top-pick-card";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { IoAddSharp } from "react-icons/io5";

export default async function Page() {
  const supabase = createClient();
  const { data: topPicks, error } = await supabase.from("top_picks").select();

  if (error) {
    return <div>{`An error occurred: ${error.message}`}</div>;
  }

  return (
    <div className="flex flex-col">
      <div className="flex justify-between">
        <h1>Top Picks</h1>
        <Link
          href="/dashboard/top-picks/create-top-pick"
          className="p-2.5 bg-white text-black rounded-full"
        >
          <IoAddSharp />
        </Link>
      </div>
      <div className="border-t border-white my-4"></div>
      <div className="gap-1 md:gap-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {topPicks.length > 0 ? (
          topPicks.map((topPick) => (
           <TopPickCard key={topPick.id} topPick={topPick} />
          ))
        ) : (
          <div>No items</div>
        )}
      </div>
    </div>
  );
}
