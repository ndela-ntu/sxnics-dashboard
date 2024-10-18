import { deleteTopPick } from "@/app/actions";
import { MdDelete } from "react-icons/md";

export function DeleteTopPickButton({ id }: { id: number }) {
  const deleteTopPickWithId = deleteTopPick.bind(null, id);

  return (
    <form action={deleteTopPickWithId}>
      <button type="submit" className="rounded-full bg-white text-black p-2.5">
        <MdDelete className="text-black h-4 w-4 md:h-6 md:w-6" />
      </button>
    </form>
  );
}
