import ShopItem from "@/components/ui/shop/shop-item";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { MdEdit } from "react-icons/md";
import { IoAddSharp } from "react-icons/io5";

export const revalidate = 60;

export default async function Page() {
  const supabase = createClient();
  const { data: shopItems, error } = await supabase
    .from("shop_items")
    .select("*")
    .abortSignal(AbortSignal.timeout(5000));

  if (error) {
    return <div>{`An error occurred: ${error.message}`}</div>;
  }

  return (
    <div className="flex flex-col">
      <div className="flex justify-between">
        <h1>Shop Items</h1>
        <Link
          href="/dashboard/shop/create-item"
          className="p-2.5 bg-white text-black rounded-full"
        >
          <IoAddSharp />
        </Link>
      </div>
      <div className="border-t border-white my-4"></div>
      <div className="gap-1 md:gap-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {shopItems.length > 0 ? (
          shopItems.map((shopItem) => (
            <ShopItem key={shopItem.id} item={shopItem} />
          ))
        ) : (
          <div>No items</div>
        )}
      </div>
    </div>
  );
}
