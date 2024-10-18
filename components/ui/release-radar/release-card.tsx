import { IRelease } from "@/models/release";
import Image from "next/image";
import EditButton from "../edit-button";
import { DeleteReleaseButton } from "./delete-release-button";

export default function ReleaseCard({ release }: { release: IRelease }) {
  return (
    <div className="border flex flex-col justify-between shadow-md overflow-hidden p-1 md:p-2.5">
      <div className="relative aspect-square">
        <Image
          src={release.imageUrl}
          alt="Image of artist"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="w-full">
        <label className="text-base italic">{release.name}</label>{" "}by{" "}
        <label className="text-sm">{release.artist}</label>
      </div>
      <div className="flex items-center justify-center pt-5 space-x-5">
        <EditButton href={`/dashboard/release-radar/edit-release/${release.id}`} />
        <DeleteReleaseButton id={release.id} />
      </div>
    </div>
  );
}
