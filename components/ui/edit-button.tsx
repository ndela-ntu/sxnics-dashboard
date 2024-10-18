import Link from "next/link";
import { MdEdit } from "react-icons/md";

export default function EditButton({ href }: { href: string }) {
  return (
    <Link href={href} className="rounded-full bg-white text-black p-2.5">
      <MdEdit className="text-black h-4 w-4 md:h-6 md:w-6" />
    </Link>
  );
}
