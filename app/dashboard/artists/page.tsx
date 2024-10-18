import ArtistCard from "@/components/ui/artists/artist-card";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { IoAddSharp } from "react-icons/io5";

export const revalidate = 60;

export default async function Page() {
  const supabase = createClient();
  const { data: artists, error } = await supabase
    .from("artists")
    .select();

  if (error) {
    return <div>{`An error occurred: ${error.message}`}</div>;
  }

  return (
    <div className="flex flex-col">
      <div className="flex justify-between">
        <h1>Artists</h1>
        <Link
          href="/dashboard/artists/create-artist"
          className="p-2.5 bg-white text-black rounded-full"
        >
          <IoAddSharp />
        </Link>
      </div>
      <div className="border-t border-white my-4"></div>
      <div className="gap-1 md:gap-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {artists.length > 0 ? (
          artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))
        ) : (
          <div>No items</div>
        )}
      </div>
    </div>
  );
}
