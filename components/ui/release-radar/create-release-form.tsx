"use client";

import { ReleaseState, createRelease } from "@/app/actions";
import SubmitButton from "@/components/submit-button";
import { useFormState } from "react-dom";

export default function CreateReleaseForm() {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState<ReleaseState, FormData>(
    createRelease,
    initialState
  );

  return (
    <form
      action={dispatch}
      className="flex flex-col items-center justify-center space-y-2 w-full"
    >
      <div className="mb-4 w-full md:w-1/2">
        <label>Name</label>
        <input
          className="p-1.5 bg-transparent text-white border border-white w-full"
          name="name"
          type="text"
          placeholder="Name"
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
      <div className="mb-4 w-full md:w-1/2">
        <label>Artist</label>
        <input
          className="p-1.5 bg-transparent text-white border border-white w-full"
          name="artist"
          type="text"
          placeholder="Artist"
          required
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
        <label>About Release</label>
        <textarea
          name="about"
          className="p-1.5 bg-transparent text-white border border-white w-full"
          placeholder="About release"
          rows={5}
          minLength={20}
          maxLength={5000}
        ></textarea>
        <div id="name-error" aria-live="polite" aria-atomic="true">
          {state.errors?.about &&
            state.errors.about.map((error: string, i) => (
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
        <label>Type</label>
        <select
          className="p-1.5 bg-transparent border border-white w-full"
          name="type"
        >
          <option className="text-black" value="Vinyl">
            Vinyl
          </option>
          <option className="text-black" value="Digital">
            Digital
          </option>
          <option className="text-black" value="CD">
            CD
          </option>
        </select>
        <div id="name-error" aria-live="polite" aria-atomic="true">
          {state.errors?.type &&
            state.errors.type.map((error: string, i) => (
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
          required
        />
        <div id="price-error" aria-live="polite" aria-atomic="true">
          {state.errors?.image &&
            state.errors.image.map((error: string, i) => (
              <p key={i} className="text-sm text-red-500">
                {error}
              </p>
            ))}
        </div>
      </div>
      <SubmitButton>Save</SubmitButton>
    </form>
  );
}
