"use client";

import { ArtistState, createArtist } from "@/app/actions";
import SubmitButton from "@/components/submit-button";
import { useFormState } from "react-dom";

export default function CreateArtistForm() {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState<ArtistState, FormData>(
    createArtist,
    initialState
  );

  return (
    <form
      action={(formData) => {
        const socialLinksJson = {
          instagram: formData.get("instagram"),
          x: formData.get("x"),
        };

        formData.append("socialLinks", JSON.stringify(socialLinksJson));
        dispatch(formData);
      }}
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
        <label>Bio</label>
        <textarea
          name="bio"
          className="p-1.5 bg-transparent text-white border border-white w-full"
          placeholder="Bio"
          rows={5}
          minLength={20}
          maxLength={5000}
        ></textarea>
        <div id="name-error" aria-live="polite" aria-atomic="true">
          {state.errors?.bio &&
            state.errors.bio.map((error: string, i) => (
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
      <div className="mb-4 md:w-1/2">
        <div className="flex items-center space-x-2.5">
          <span>Instagram</span>
          <input
            className="p-1.5 bg-transparent text-white border border-white w-full"
            name="instagram"
            type="text"
            placeholder="Name"
            required
          />
        </div>
        <div className="flex items-center space-x-2.5">
          <span>X</span>
          <input
            className="p-1.5 bg-transparent text-white border border-white w-full"
            name="x"
            type="text"
            placeholder="Name"
            required
          />
        </div>
      </div>
      <SubmitButton>Save</SubmitButton>
    </form>
  );
}
