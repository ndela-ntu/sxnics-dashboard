import EditEventForm from "@/components/ui/events/edit-event-form";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { id: number } }) {
  const supabase = createClient();
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!event) {
    notFound();
  }

  return (
    <div>
      <h1>Edit Event</h1>
      <div className="border-t border-white my-4"></div>
      <EditEventForm event={event} />
    </div>
  );
}
