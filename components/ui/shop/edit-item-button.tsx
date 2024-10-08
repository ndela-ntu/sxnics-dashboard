import Link from "next/link";
import { MdEdit } from "react-icons/md";

export default function EditItemButton({ id }: { id: number }) {
  return (
    <Link
      href={`/dashboard/shop/edit-item/${id}`}
      className="rounded-full bg-white text-black p-2.5"
    >
      <MdEdit className="text-black h-6 w-6" />
    </Link>
  );
}
