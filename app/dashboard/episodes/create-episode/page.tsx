import CreateEpisodeForm from "@/components/ui/episodes/create-episode-form";
import { createClient } from "@/utils/supabase/server";

export const revalidate = 60;

export default async function Page() {
  const supabase = createClient();
  const { data: artists, error } = await supabase.from("artists").select("*");

  if (artists?.length === 0) {
    return <div>No artists to map to episode. Please create an artist first.</div>
  }

  if (error) {
    return <div>{`An error occurred: ${error.message}`}</div>;
  }

  return (
    <div>
      <h1>Create Episode</h1>
      <div className="border-t border-white my-4"></div>
      <CreateEpisodeForm artists={artists} />
    </div>
  );
}
