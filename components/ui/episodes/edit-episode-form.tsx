"use client";

import { EpisodeState, createEpisode, editEpisode } from "@/app/actions";
import { IEpisode } from "@/models/episode";
import { Loader2 } from "lucide-react";
import Image from "next/image";
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

export default function EditEpisodeForm({ episode }: { episode: IEpisode }) {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState<EpisodeState, FormData>(
    editEpisode,
    initialState
  );

  return (
    <form
      className="flex flex-col items-center justify-center space-y-2 w-full"
      action={dispatch}
    >
      <input type="hidden" name="id" value={episode.id} />
      <input type="hidden" name="currentImageUrl" value={episode.imageUrl} />
      <div className="mb-4 w-full md:w-1/2">
        <label>Name</label>
        <input
          className="p-1.5 bg-transparent text-white border border-white w-full"
          name="name"
          type="text"
          defaultValue={episode.name}
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
        />
        <div id="price-error" aria-live="polite" aria-atomic="true">
          {state.errors?.image &&
            state.errors.image.map((error: string, i) => (
              <p key={i} className="text-sm text-red-500">
                {error}
              </p>
            ))}
        </div>
        <p className="mt-2 text-sm italic">
          *Leave empty to keep the current image
        </p>
      </div>
      <div className="mb-4 w-full md:w-1/2">
        <p className="block text-sm font-medium text-white-700">
          Current Image
        </p>
        <div className="mt-2 relative h-48 w-48">
          <Image
            src={episode.imageUrl}
            alt={episode.name}
            fill
            className="object-cover rounded-md"
          />
        </div>
      </div>
      <p className="mt-2 text-sm italic">
        *Audio uneditable, delete episode and re-upload to make changes
      </p>
      {/* <div className="mb-4 md:w-1/2">
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
      </div> */}

      <SubmitButton />
    </form>
  );
}
