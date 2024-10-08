import { usePathname } from "next/navigation";

import SignOutButton from "./sign-out-button";
import NavLinks from "./nav-links";

export default function SideNav() {
  return (
    <div className="w-full flex flex-col items-center justify-center py-5">
      <h1 className="text-5xl pb-5">SXNICS</h1>
      <div className="flex w-full px-2.5"><NavLinks /></div>
    </div>
  );
}
