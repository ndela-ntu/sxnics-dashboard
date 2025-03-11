import EventsCard from "@/components/ui/events/events-card";
import ReleaseCard from "@/components/ui/release-radar/release-card";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { IoAddSharp } from "react-icons/io5";

export default async function Page() {
  const supabase = createClient();
  const { data: events, error } = await supabase.from("events").select();

  if (error) {
    return <div>{`An error occurred: ${error.message}`}</div>;
  }

  return (
    <div className="flex flex-col">
      <div className="flex justify-between">
        <h1>Events</h1>
        <Link
          href="/dashboard/event-manager/create-event"
          className="p-2.5 bg-white text-black rounded-full"
        >
          <IoAddSharp />
        </Link>
      </div>
      <div className="border-t border-white my-4"></div>
      <div className="gap-1 md:gap-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {events.length > 0 ? (
          events.map((event) => <EventsCard key={event.id} event={event} />)
        ) : (
          <div>No items</div>
        )}
      </div>
    </div>
  );
}
