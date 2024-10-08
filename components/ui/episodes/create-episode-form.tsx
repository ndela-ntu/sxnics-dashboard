"use client";

import { EpisodeState, createEpisode } from "@/app/actions";
import { Loader2 } from "lucide-react";
import { useFormState, useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center justify-center bg-white px-2 py-1 text-black"
    >
      {pending ? (
        <Loader2 className="h-7 w-7 animate-spin" />
      ) : (
        <span>Save</span>
      )}
    </button>
  );
}

export default function CreateEpisodeForm() {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState<EpisodeState, FormData>(
    createEpisode,
    initialState
  );

  return (
    <form
      className="flex flex-col items-center justify-center space-y-2 w-full"
      action={dispatch}
    >
      <div className="mb-4 w-full md:w-1/2">
        <label>Name</label>
        <input
          className="p-1.5 bg-transparent text-white border border-white w-full"
          name="name"
          type="text"
          placeholder="Item Name"
          required
        />
        <div id="name-error" aria-live="polite" aria-atomic="true">
          {state.errors?.name &&
            state.errors.name.map((error: string, i) => (
              <p key={i} className="text-sm text-red-500">
                {error}
              </p>
            ))}
        </div>
      </div>
      <div className="mb-4 md:w-1/2">
        <label
          htmlFor="image"
          className="block text-sm font-medium text-white-700"
        >
          Image
        </label>
        <input
          className="w-full p-1.5 bg-transparent text-white border border-white"
          name="image"
          type="file"
          accept="image/*"
          required
        />
      </div>
      <div id="price-error" aria-live="polite" aria-atomic="true">
        {state.errors?.image &&
          state.errors.image.map((error: string, i) => (
            <p key={i} className="text-sm text-red-500">
              {error}
            </p>
          ))}
      </div>
      <div className="mb-4 md:w-1/2">
        <label
          htmlFor="image"
          className="block text-sm font-medium text-white-700"
        >
          Audio
        </label>
        <input
          className="w-full p-1.5 bg-transparent text-white border border-white"
          name="audio"
          type="file"
          accept="audio/*"
          required
        />
        <div id="price-error" aria-live="polite" aria-atomic="true">
          {state.errors?.audio &&
            state.errors.audio.map((error: string, i) => (
              <p key={i} className="text-sm text-red-500">
                {error}
              </p>
            ))}
        </div>
      </div>
      <SubmitButton />
      {/* <button
        disabled={pending}
        className="bg-white px-2 py-1 text-black"
        type="submit"
      >
        {pending ? <Loader2 className="h4 w-4 animate-spin" /> : "Save"}
      </button> */}
    </form>
  );
}
