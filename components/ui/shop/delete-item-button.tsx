import { deleteShopItem } from "@/app/actions";
import { MdDelete } from "react-icons/md";

export function DeleteItemButton({ id }: { id: number }) {
  const deleteShopItemWithId = deleteShopItem.bind(null, id);

  return (
    <form action={deleteShopItemWithId}>
      <button type="submit" className="rounded-full bg-white text-black p-2.5">
        <MdDelete className="text-black h-6 w-6" />
      </button>
    </form>
  );
}
