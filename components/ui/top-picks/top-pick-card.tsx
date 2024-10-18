import { ITopPick } from "@/models/top-pick";
import Image from 'next/image';
import EditButton from "../edit-button";
import { DeleteTopPickButton } from "./delete-top-pick-button";

export default function TopPickCard({ topPick }: { topPick: ITopPick }) {
  return (
    <div className="border flex flex-col justify-between shadow-md overflow-hidden p-1 md:p-2.5">
      <div className="relative aspect-square">
        <Image
          src={topPick.imageUrl}
          alt="Image of artist"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="w-full">
        <label className="text-base italic">{topPick.name}</label> by{" "}
        <label className="text-sm">{topPick.artist}</label>
      </div>
      <div className="flex items-center justify-center pt-5 space-x-5">
        <EditButton
          href={`/dashboard/top-picks/edit-top-pick/${topPick.id}`}
        />
        <DeleteTopPickButton id={topPick.id} />
      </div>
    </div>
  );
}
