import EditItemForm from "@/components/ui/shop/edit-item-form";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { id: number } }) {
  const supabase = createClient();
  const { data: shopItem, error: shopItemError } = await supabase
    .from("shop_items")
    .select(`*, shop_item_type(id, type, has_sizes)`)
    .eq("id", params.id)
    .single();

  if (!shopItem) {
    notFound();
  }

  const { data: shopItemVariants, error: variantsError } = await supabase
    .from("shop_item_variant")
    .select(`*, color(id, name, hash_color), size(id, name)`)
    .eq("shop_item_id", params.id);

  if (shopItemError || variantsError) {
    return <div>{`An error occurred: ${shopItemError || variantsError}`}</div>;
  }

  return (
    <div>
      <h1>Edit Item</h1>
      <div className="border-t border-white my-4"></div>
      <EditItemForm item={shopItem} variants={shopItemVariants} />
    </div>
  );
}
