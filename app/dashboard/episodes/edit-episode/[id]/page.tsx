import EditEpisodeForm from "@/components/ui/episodes/edit-episode-form";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { id: number } }) {
  const supabase = createClient();
  const { data: episode, error } = await supabase
    .from("episodes")
    .select("*")
    .eq("id", params.id)
    .single();


  if (!episode) {
    notFound();
  }

  return (
    <div>
      <h1>Edit Episode</h1>
      <div className="border-t border-white my-4"></div>
      <EditEpisodeForm episode={episode} />
    </div>
  );
}
