"use client";

import { ReleaseState, createRelease } from "@/app/actions";
import SubmitButton from "@/components/submit-button";
import { IEvent } from "@/models/event";
import Image from "next/image";
import { useState } from "react";
import { useFormState } from "react-dom";
import ImageUploader from "./image-upload";

export default function EditEventForm({ event }: { event: IEvent }) {
  const [dateTime, setDateTime] = useState(event.date);

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
      <input type="hidden" name="id" value={event.id} />
      <input type="hidden" name="currentImageUrl" value={event.coverUrl} />
      <div className="mb-4 w-full md:w-1/2">
        <label>Name</label>
        <input
          className="p-1.5 bg-transparent text-white border border-white w-full"
          name="name"
          type="text"
          placeholder="Name"
          required
          defaultValue={event.name}
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
        <label>Location</label>
        <input
          className="p-1.5 bg-transparent text-white border border-white w-full"
          name="location"
          type="text"
          placeholder="Location"
          required
          defaultValue={event.location}
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
        <label>About Event/Description</label>
        <textarea
          name="about"
          className="p-1.5 bg-transparent text-white border border-white w-full"
          placeholder="About release"
          rows={5}
          minLength={20}
          maxLength={5000}
          defaultValue={event.about}
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
        <label>Ticket Link</label>
        <input
          className="p-1.5 bg-transparent text-white border border-white w-full"
          name="ticketLink"
          type="text"
          placeholder="Ticket Link"
          required
          defaultValue={event.ticketLink}
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
        <label>Event By</label>
        <select
          className="p-1.5 bg-transparent border border-white w-full"
          name="eventBy"
          defaultValue={event.eventBy}
        >
          <option className="text-black" value="sxnics">
            Sxnics
          </option>
          <option className="text-black" value="other">
            Other
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
        <label>Event Date</label>
        <input
          type="datetime-local"
          className="border px-3 py-2 text-white bg-transparent focus:outline-none focus:ring"
          id="datetime"
          name="eventDate"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
        />
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
          htmlFor="cover"
          className="block text-sm font-medium text-white-700"
        >
          Image
        </label>
        <input
          className="w-full p-1.5 bg-transparent text-white border border-white"
          name="cover"
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
            src={event.coverUrl}
            alt={event.name}
            fill
            className="object-cover rounded-md"
          />
        </div>
      </div>
      <ImageUploader />
      <SubmitButton>Save</SubmitButton>
    </form>
  );
}
