"use client";

import { EpisodeState, createEpisode, editEpisode } from "@/app/actions";
import SubmitButton from "@/components/submit-button";
import { IArtist } from "@/models/artist";
import { IEpisode } from "@/models/episode";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useFormState, useFormStatus } from "react-dom";

interface EditProps {
  episode: IEpisode;
  artists: IArtist[];
}

type FieldName = "name" | "artistId" | "description" | "tag" | "image";

export default function EditEpisodeForm({ episode, artists }: EditProps) {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState<EpisodeState, FormData>(
    editEpisode,
    initialState
  );

  const renderErrors = (fieldName: FieldName) => {
    if (state?.errors && fieldName in state.errors) {
      const fieldErrors = state.errors[fieldName];
      return fieldErrors?.map((error: string, i: number) => (
        <p key={i} className="text-sm text-red-500">
          {error}
        </p>
      ));
    }
    return null;
  };

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
          {renderErrors("name")}
        </div>
      </div>
      <div className="mb-4 w-full md:w-1/2">
        <label>Artist</label>
        <select
          defaultValue={episode.artistId}
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
          defaultValue={episode.description}
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
          defaultValue={episode.tag}
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
          <option className="text-black" value="Alternative-Rnb">
            Alternative RnB
          </option>
          <option className="text-black" value="Jazz">
            Jazz
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
        />
        <div id="image-error" aria-live="polite" aria-atomic="true">
          {renderErrors("image")}
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

      <SubmitButton>Save</SubmitButton>
    </form>
  );
}
