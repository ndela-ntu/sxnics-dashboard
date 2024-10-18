import EditArtistForm from "@/components/ui/artists/edit-artist-form";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { id: number } }) {
  const supabase = createClient();
  const { data: artist, error: artistError } = await supabase
    .from("artists")
    .select("*")
    .eq("id", params.id)
    .single();

  console.log(artist, params);

  if (!artist) {
    notFound();
  }

  return (
    <div>
      <h1>Edit Artist</h1>
      <div className="border-t border-white my-4"></div>
      <EditArtistForm artist={artist} />
    </div>
  );
}
