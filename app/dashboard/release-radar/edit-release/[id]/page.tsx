import EditEpisodeForm from "@/components/ui/episodes/edit-episode-form";
import EditReleaseForm from "@/components/ui/release-radar/edit-release-form";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { id: number } }) {
  const supabase = createClient();
  const { data: release, error } = await supabase
    .from("releases")
    .select("*")
    .eq("id", params.id)
    .single();


  if (!release) {
    notFound();
  }

  return (
    <div>
      <h1>Edit Release</h1>
      <div className="border-t border-white my-4"></div>
      <EditReleaseForm release={release} />
    </div>
  );
}
