'use client';

import { ArtistState, editArtist } from "@/app/actions";
import { IArtist } from "@/models/artist";
import { useFormState } from "react-dom";
import Image from "next/image";
import SubmitButton from "@/components/submit-button";

export default function EditArtistForm({ artist }: { artist: IArtist }) {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState<ArtistState, FormData>(
    editArtist,
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
      <input type="hidden" name="id" value={artist.id} />
      <input type="hidden" name="currentImageUrl" value={artist.imageUrl} />
      <div className="mb-4 w-full md:w-1/2">
        <label>Name</label>
        <input
          className="p-1.5 bg-transparent text-white border border-white w-full"
          name="name"
          type="text"
          placeholder="Name"
          defaultValue={artist.name}
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
          defaultValue={artist.bio}
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
            src={artist.imageUrl}
            alt="Image of artist"
            fill
            className="object-cover rounded-md"
          />
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
            defaultValue={artist.socialLinks["instagram"]}
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
            defaultValue={artist.socialLinks["x"]}
          />
        </div>
      </div>
      <SubmitButton>Save</SubmitButton>
    </form>
  );
}
