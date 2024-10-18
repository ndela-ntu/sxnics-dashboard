import EditTopPickForm from "@/components/ui/top-picks/edit-top-pick-form";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { id: number } }) {
  const supabase = createClient();
  const { data: topPick, error } = await supabase
    .from("top_picks")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!topPick) {
    notFound();
  }

  return (
    <div>
      <h1>Edit Item</h1>
      <div className="border-t border-white my-4"></div>
      <EditTopPickForm topPick={topPick} />
    </div>
  );
}
