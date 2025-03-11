import { deleteRelease } from "@/app/actions";
import { MdDelete } from "react-icons/md";

export function DeleteEventButton({ id }: { id: number }) {
  const deleteReleaseWithId = deleteRelease.bind(null, id);

  return (
    <form action={deleteReleaseWithId}>
      <button type="submit" className="rounded-full bg-white text-black p-2.5">
        <MdDelete className="text-black h-4 w-4 md:h-6 md:w-6" />
      </button>
    </form>
  );
}
