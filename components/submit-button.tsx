"use client";

import { Loader2 } from "lucide-react";
import { ReactNode } from "react";
import { useFormStatus } from "react-dom";

export default function SubmitButton({ children, uploading}: { children: ReactNode, uploading?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || uploading}
      className="flex items-center justify-center bg-white px-2 py-1 text-black"
    >
      {(uploading || pending) ? (
        <Loader2 className="h-7 w-7 animate-spin" />
      ) : (
        <span>{children}</span>
      )}
    </button>
  );
}
