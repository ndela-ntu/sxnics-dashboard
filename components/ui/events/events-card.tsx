import { IRelease } from "@/models/release";
import Image from "next/image";
import EditButton from "../edit-button";
import { IEvent } from "@/models/event";
import { DeleteEventButton } from "./delete-event-button";

export default function EventsCard({ event }: { event: IEvent }) {
    return (
    <div className="border flex flex-col justify-between shadow-md overflow-hidden p-1 md:p-2.5">
      <div className="relative aspect-square">
        <Image
          src={event.coverUrl}
          alt="Image of event"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="w-full flex flex-col">
        <label className="text-base font-semibold">{event.name}</label>
        <span>{new Date(event.eventDate).toLocaleString()}</span>
        <span>{event.location}</span>
      </div>
      <div className="flex items-center justify-center pt-5 space-x-5">
        <EditButton href={`/dashboard/event-manager/edit-event/${event.id}`} />
        <DeleteEventButton id={event.id} />
      </div>
    </div>
  );
}
