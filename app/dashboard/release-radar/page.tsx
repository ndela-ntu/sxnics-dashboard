import ReleaseCard from "@/components/ui/release-radar/release-card";
import { createClient } from "@/utils/supabase/server";
import Link from 'next/link';
import { IoAddSharp } from "react-icons/io5";

export default async function Page() {
  const supabase = createClient();
  const { data: releases, error } = await supabase.from("releases").select();

  if (error) {
    return <div>{`An error occurred: ${error.message}`}</div>;
  }

  return (
    <div className="flex flex-col">
      <div className="flex justify-between">
        <h1>Release Radar</h1>
        <Link
          href="/dashboard/release-radar/create-release"
          className="p-2.5 bg-white text-black rounded-full"
        >
          <IoAddSharp />
        </Link>
      </div>
      <div className="border-t border-white my-4"></div>
      <div className="gap-1 md:gap-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {releases.length > 0 ? (
          releases.map((release) => (
            <ReleaseCard key={release.id} release={release} />
          ))
        ) : (
          <div>No items</div>
        )}
      </div>
    </div>
  );
}
