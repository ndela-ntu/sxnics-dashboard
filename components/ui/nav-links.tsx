"use client";

import { CiShop } from "react-icons/ci";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoIosMusicalNote } from "react-icons/io";
import SignOutButton from "./sign-out-button";

const links = [
  // {
  //   name: "Home",
  //   href: "/dashboard",
  //   icon: <FaHome className="" />,
  // },
  // {
  //   name: "Audio Manager",
  //   href: "/dashboard/audio-manager",
  //   icon: <MdAudiotrack />,
  // },
  // // {
  //   name: "Blog Manager",
  //   href: "/dashboard/blog-manager",
  //   icon: <FaBlogger />,
  // },
  {
    name: "Shop",
    href: "/dashboard/shop",
    icon: <CiShop />,
  },
  {
    name: "Episodes",
    href: "/dashboard/episodes",
    icon: <IoIosMusicalNote />,
  },
  // {
  //   name: "Monthly Picks",
  //   href: "/dashboard/monthly-picks",
  //   icon: <SlCalender />,
  // },
  // {
  //   name: "Event Manager",
  //   href: "dashboard/event-manager",
  //   icon: <MdEventAvailable />,
  // },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <div className="w-full flex md:flex-col justify-between items-center">
      {links.map((link) => {
        return (
          <Link
            className={`w-full flex h-[48px] grow items-center justify-center gap-2 rounded-md ${
              pathname === link.href
                ? "text-white bg-black border border-white"
                : "text-black bg-white border border-black"
            } p-3 font-medium hover:bg-gray-950 hover:text-white md:flex-none md:justify-start md:p-2 md:px-3`}
            key={link.name}
            href={link.href}
          >
            <span>{link.icon}</span>
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
      <div className="md:w-full">
        <SignOutButton />
      </div>
    </div>
  );
}
