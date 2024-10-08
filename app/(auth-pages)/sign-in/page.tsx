import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import SubmitButton from "@/components/submit-button";

export default function Login({ searchParams }: { searchParams: Message }) {
  return (
    <form
      action={signInAction}
      className="flex flex-col items-center justify-center w-full"
    >
      <h1 className="text-2xl font-medium">Sign in</h1>
      <div className="flex flex-col gap-2 [&>input]:mb-3 mt-4 border p-5">
        <div className="flex flex-col">
          <label>Name</label>
          <input
            className="p-1.5 bg-transparent text-white border border-white w-full"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="flex flex-col">
          <label>Password</label>
          <input
            className="p-1.5 bg-transparent text-white border border-white w-full"
            name="password"
            type="password"
            placeholder="12345"
            required
          />
        </div>

        <SubmitButton>Sign in</SubmitButton>
        <FormMessage message={searchParams} />
      </div>
    </form>
  );
}
