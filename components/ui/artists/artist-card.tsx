import { IArtist } from "@/models/artist";
import Image from "next/image";
import DeleteArtistButton from "./delete-artist-button";
import EditButton from "../edit-button";

export default function ArtistCard({ artist }: { artist: IArtist }) {
  return (
    <div className="border shadow-md overflow-hidden p-1 md:p-2.5">
      <div className="relative aspect-square">
        <Image
          src={artist.imageUrl}
          alt="Image of artist"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="flex w-full flex-col">
        <label className="text-base">{artist.name}</label>
      </div>
      <div className="flex items-center justify-center pt-5 space-x-5">
        <EditButton href={`/dashboard/artists/edit-artist/${artist.id}`} />
        <DeleteArtistButton id={artist.id} />
      </div>
    </div>
  );
}
