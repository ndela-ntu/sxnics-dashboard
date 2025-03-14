import { deleteShopItem } from "@/app/actions";
import { MdDelete } from "react-icons/md";

export function DeleteItemButton({ id }: { id: number }) {
  const deleteShopItemWithId = deleteShopItem.bind(null, id);

  return (
    <form action={deleteShopItemWithId}>
      <button type="submit" className="rounded-full bg-white text-black p-2.5">
        <MdDelete className="text-black h-4 w-4 md:h-6 md:w-6" />
      </button>
    </form>
  );
}
