import EpisodeCard from "@/components/ui/episodes/episode-card";
import { mergeEpisodes } from "@/lib/merge_episodes";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { IoAddSharp } from "react-icons/io5";

export const revalidate = 60;

export default async function Page() {
  const supabase = createClient();

  const { data: aEpisodes, error: aEpisodesError } = await supabase.from("episodes").select(
    `*, artists (
      id, name
     )`
  );

  const { data: vEpisodes, error: vEpisodesError } = await supabase
    .from("video_episodes")
    .select(`*, artists(id, name)`);

  if (aEpisodesError || vEpisodesError) {
    return <div>{`An error occurred: ${aEpisodesError?.message || vEpisodesError?.message}`}</div>;
  }

  const episodes = mergeEpisodes(vEpisodes, aEpisodes)

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
      <div className="flex flex-col w-full space-y-1 md:space-y-2">
        {episodes.map((episode) => (
          <EpisodeCard key={episode.id} episode={episode} />
        ))}
      </div>
    </div>
  );
}
