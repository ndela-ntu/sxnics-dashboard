"use client";

import { TopPickState, createTopPick, editTopPick } from "@/app/actions";
import SubmitButton from "@/components/submit-button";
import { ITopPick } from "@/models/top-pick";
import { useFormState } from "react-dom";
import Image from "next/image";

export default function EditTopPickForm({ topPick }: { topPick: ITopPick }) {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState<TopPickState, FormData>(
    editTopPick,
    initialState
  );

  return (
    <form
      action={dispatch}
      className="flex flex-col items-center justify-center space-y-2 w-full"
    >
      <input type="hidden" name="id" value={topPick.id} />
      <input type="hidden" name="currentImageUrl" value={topPick.imageUrl} />
      <div className="mb-4 w-full md:w-1/2">
        <label>Name</label>
        <input
          className="p-1.5 bg-transparent text-white border border-white w-full"
          name="name"
          type="text"
          placeholder="Name"
          required
          defaultValue={topPick.name}
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
      <div className="mb-4 w-full md:w-1/2">
        <label>Artist</label>
        <input
          className="p-1.5 bg-transparent text-white border border-white w-full"
          name="artist"
          type="text"
          placeholder="Artist"
          required
          defaultValue={topPick.artist}
        />
        <div id="name-error" aria-live="polite" aria-atomic="true">
          {state.errors?.artist &&
            state.errors.artist.map((error: string, i) => (
              <p key={i} className="text-sm text-red-500">
                {error}
              </p>
            ))}
        </div>
      </div>
      <div className="mb-4 w-full md:w-1/2">
        <label>Purchase Link</label>
        <input
          className="p-1.5 bg-transparent text-white border border-white w-full"
          name="purchaseLink"
          type="text"
          placeholder="Purchase Link"
          required
          defaultValue={topPick.purchaseLink}
        />
        <div id="name-error" aria-live="polite" aria-atomic="true">
          {state.errors?.purchaseLink &&
            state.errors.purchaseLink.map((error: string, i) => (
              <p key={i} className="text-sm text-red-500">
                {error}
              </p>
            ))}
        </div>
      </div>
      <div className="mb-4 w-full md:w-1/2">
        <label>Tag</label>
        <select
          className="p-1.5 bg-transparent border border-white w-full"
          name="tag"
          defaultValue={topPick.tag}
        >
          <option className="text-black" value="Deep-House">
            Deep House
          </option>
          <option className="text-black" value="Soulful-House">
            Soulful House
          </option>
          <option className="text-black" value="Lounge">
            Lounge
          </option>
          <option className="text-black" value="Broken-Beats">
            Broken Beats
          </option>
          <option className="text-black" value="Afro-House">
            Afro House
          </option>
          <option className="text-black" value="Minimal-House">
            Minimal House
          </option>
        </select>
        <div id="name-error" aria-live="polite" aria-atomic="true">
          {state.errors?.tag &&
            state.errors.tag.map((error: string, i) => (
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
            src={topPick.imageUrl}
            alt="Album cover"
            fill
            className="object-cover rounded-md"
          />
        </div>
      </div>
      <SubmitButton>Save</SubmitButton>
    </form>
  );
}
