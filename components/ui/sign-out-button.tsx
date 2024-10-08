import { signOutAction } from "@/app/actions";
import { CiPower } from "react-icons/ci";

export default function SignOutButton() {
  return (
    <form
      action={signOutAction}
      className="w-full"
    >
      <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-white p-3 text-black font-medium hover:bg-black hover:text-white md:flex-none md:justify-start md:p-2 md:px-3">
        <CiPower />
        <div className="hidden md:block">Sign Out</div>
      </button>
    </form>
  );
}
