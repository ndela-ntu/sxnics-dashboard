import { forgotPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function ForgotPassword({
  searchParams,
}: {
  searchParams: Message;
}) {
  return (
    <>
      <form className="flex-1 flex flex-col w-full gap-2 [&>input]:mb-6 min-w-64 max-w-64 mx-auto border p-2.5">
        <div>
          <h1 className="text-2xl font-medium">Reset Password</h1>
          <p className="text-sm ">
            Already have an account?{" "}
            <Link className="underline" href="/sign-in">
              Sign in
            </Link>
          </p>
        </div>
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <Label htmlFor="email">Email</Label>
          <Input name="email" placeholder="you@example.com" required />
          <SubmitButton
            className="bg-white px-2.5 py-1 text-black"
            formAction={forgotPasswordAction}
          >
            Reset Password
          </SubmitButton>
          <FormMessage message={searchParams} />
        </div>
      </form>
    </>
  );
}
