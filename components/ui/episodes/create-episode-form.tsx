"use client";

import { EpisodeState, createEpisode } from "@/app/actions";
import SubmitButton from "@/components/submit-button";
import { IArtist } from "@/models/artist";
import { Loader2 } from "lucide-react";
import { useFormState, useFormStatus } from "react-dom";
import { string } from "zod";

export default function CreateEpisodeForm({ artists }: { artists: IArtist[] }) {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState<EpisodeState, FormData>(
    createEpisode,
    initialState
  );

  // Helper function to safely render errors
  const renderErrors = (fieldName: string) => {
    return state?.errors?.[fieldName]?.map((error: string, i: number) => (
      <p key={i} className="text-sm text-red-500">
        {error}
      </p>
    ));
  };

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
          placeholder="Name"
          required
        />
        <div id="name-error" aria-live="polite" aria-atomic="true">
          {renderErrors("name")}
        </div>
      </div>
      <div className="mb-4 w-full md:w-1/2">
        <label>Artist</label>
        <select
          name="artistId"
          className="p-1.5 bg-transparent border border-white w-full"
        >
          {artists.map((artist) => (
            <option key={artist.id} className="text-black" value={artist.id}>
              {artist.name}
            </option>
          ))}
        </select>
        <div id="artist-error" aria-live="polite" aria-atomic="true">
          {renderErrors("artistId")}
        </div>
      </div>
      <div className="mb-4 w-full md:w-1/2">
        <label>Description/Tracklist</label>
        <textarea
          name="description"
          className="p-1.5 bg-transparent text-white border border-white w-full"
          placeholder="Description/Tracklist"
          rows={5}
          minLength={15}
          maxLength={5000}
        ></textarea>
        <div id="description-error" aria-live="polite" aria-atomic="true">
          {renderErrors("description")}
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
        <div id="tag-error" aria-live="polite" aria-atomic="true">
          {renderErrors("tag")}
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
        <div id="image-error" aria-live="polite" aria-atomic="true">
          {renderErrors("image")}
        </div>
      </div>
      <div className="mb-4 md:w-1/2">
        <label
          htmlFor="audio"
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
        <div id="audio-error" aria-live="polite" aria-atomic="true">
          {renderErrors("audio")}
        </div>
      </div>
      <SubmitButton>Save</SubmitButton>
    </form>
  );
}
