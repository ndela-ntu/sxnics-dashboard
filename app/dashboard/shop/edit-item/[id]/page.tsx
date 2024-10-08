import EditItemForm from "@/components/ui/shop/edit-item-form";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { id: number } }) {
  const supabase = createClient();
  const { data: shopItem, error } = await supabase
    .from("shop_items")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!shopItem) {
    notFound();
  }

  return (
    <div>
      <h1>Edit Item</h1>
      <div className="border-t border-white my-4"></div>
      <EditItemForm item={shopItem} />
    </div>
  );
}
