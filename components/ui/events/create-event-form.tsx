"use client";

import { EventState, ReleaseState, createEvent, createRelease } from "@/app/actions";
import SubmitButton from "@/components/submit-button";
import { useState } from "react";
import { useFormState } from "react-dom";

export default function CreateEventForm() {
  const [dateTime, setDateTime] = useState("");

  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState<EventState, FormData>(
    createEvent,
    initialState
  );

  return (
    <form
      action={(formData) => {
        formData.append('eventDate', dateTime);
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
        <label>Location</label>
        <input
          className="p-1.5 bg-transparent text-white border border-white w-full"
          name="location"
          type="text"
          placeholder="Location"
          required
        />
        <div id="name-error" aria-live="polite" aria-atomic="true">
          {state.errors?.location &&
            state.errors.location.map((error: string, i) => (
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
        />
        <div id="name-error" aria-live="polite" aria-atomic="true">
          {state.errors?.ticketLink &&
            state.errors.ticketLink.map((error: string, i) => (
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
        >
          <option className="text-black" value="sxnics">
            Sxnics
          </option>
          <option className="text-black" value="other">
            Other
          </option>
        </select>
        <div id="name-error" aria-live="polite" aria-atomic="true">
          {state.errors?.eventBy &&
            state.errors.eventBy.map((error: string, i) => (
              <p key={i} className="text-sm text-red-500">
                {error}
              </p>
            ))}
        </div>
      </div>
      <div className="flex flex-col mb-4 w-full md:w-1/2">
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
          {state.errors?.eventDate &&
            state.errors.eventDate.map((error: string, i) => (
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
          Cover
        </label>
        <input
          className="w-full p-1.5 bg-transparent text-white border border-white"
          name="cover"
          type="file"
          accept="image/*"
          required
        />
        <div id="price-error" aria-live="polite" aria-atomic="true">
          {state.errors?.cover &&
            state.errors.cover.map((error: string, i) => (
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
