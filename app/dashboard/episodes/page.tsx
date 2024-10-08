import EpisodeCard from "@/components/ui/episodes/episode-card";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { IoAddSharp } from "react-icons/io5";

export const revalidate = 60;

export default async function Page() {
  const supabase = createClient();
  const { data: episodes, error } = await supabase
    .from("episodes")
    .select()
    .abortSignal(AbortSignal.timeout(5000));

  if (error) {
    return <div>{`An error occurred: ${error.message}`}</div>;
  }

  return (
    <div className="flex flex-col">
      <div className="flex justify-between">
        <h1>Episodes</h1>
        <Link
          href="/dashboard/episodes/create-episode"
          className="p-2.5 bg-white text-black rounded-full"
        >
          <IoAddSharp />
        </Link>
      </div>
      <div className="border-t border-white my-4"></div>
      <div className="flex flex-col w-full">
        {episodes.map((episode) => (
          <EpisodeCard key={episode.id} episode={episode} />
        ))}
      </div>
    </div>
  );
}
