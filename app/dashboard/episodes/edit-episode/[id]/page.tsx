import EditEpisodeForm from "@/components/ui/episodes/edit-episode-form";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { id: number } }) {
  const supabase = createClient();
  const { data: episode, error: episodeError } = await supabase
    .from("episodes")
    .select("*")
    .eq("id", params.id)
    .single();

  const { data: artists, error: artistsError } = await supabase
    .from("artists")
    .select();

  if (artists?.length === 0) {
    return (
      <div>No artists to map to episode. Please create an artist first.</div>
    );
  }

  if (episodeError || artistsError) {
    return (
      <div>{`An error occurred: ${episodeError?.message}, ${artistsError?.message}`}</div>
    );
  }

  if (!episode) {
    notFound();
  }

  return (
    <div>
      <h1>Edit Episode</h1>
      <div className="border-t border-white my-4"></div>
      <EditEpisodeForm episode={episode} artists={artists} />
    </div>
  );
}
