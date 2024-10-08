import Link from "next/link";
import { FaArrowRightLong } from "react-icons/fa6";

export default async function Index() {
  return (
    <>
      <main className="flex flex-col h-screen items-center justify-center">
        <h1 className="text-2xl my-5">Welcome to the SXNICS admin portal.</h1>
        <Link
          className="bg-white flex text-black px-2.5 py-1 rounded-md items-center space-x-2.5"
          href="/dashboard"
        >
          <span>Continue</span>
          <span>
            <FaArrowRightLong />
          </span>
        </Link>
      </main>
    </>
  );
}
