"use client";

import {
  EventState,
  ReleaseState,
  createRelease,
  editEvent,
} from "@/app/actions";
import SubmitButton from "@/components/submit-button";
import { IEvent } from "@/models/event";
import Image from "next/image";
import { useRef, useState } from "react";
import { useFormState } from "react-dom";
import ImageUploader from "./multiple-image-upload";
import MultipleImageUpload from "./multiple-image-upload";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/utils/supabase/client";

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

export default function EditEventForm({ event }: { event: IEvent }) {
  const supabase = createClient();
  const [dateTime, setDateTime] = useState(event.eventDate);
  const [eventIsSxnics, setEventIsSxnics] = useState<boolean>(
    event.eventBy === "sxnics"
  );
  const [uploading, setUploading] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExisitingImages] = useState<string[]>(
    event.sxnicsEventGallery?.map((imageUrl) => imageUrl) ?? []
  );

  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState<EventState, FormData>(
    editEvent,
    initialState
  );

  const deleteImage = async (imageUrl: string) => {
    try {
      const url = new URL(imageUrl);

      // Extract the bucket name and object key correctly
      const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME; // Use the bucket name from environment variables
      const objectKey = url.pathname.substring(1); // Remove the leading "/"

      console.log("Deleting image from S3:", { bucketName, objectKey }); // Debug log

      const params = {
        Bucket: bucketName, // Use the bucket name directly
        Key: objectKey, // The object key includes the "gallery/" prefix
      };

      const command = new DeleteObjectCommand(params);
      await s3Client.send(command);
      console.log("Image deleted successfully:", imageUrl); // Debug log

      const newGallery = existingImages.filter((url) => url !== imageUrl);
      const { error } = await supabase
        .from("events")
        .update({ sxnicsEventGallery: newGallery })
        .eq("id", event.id);

      if (error) {
        throw Error(error.message);
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      throw error; // Propagate the error
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    try {
      if (!formRef.current) return;

      const formData = new FormData(formRef.current);
      const images = selectedImages;

      const uploadedUrls = [...existingImages];

      for (const image of images) {
        if (!(image instanceof File)) {
          console.error("Invalid file object", image);
          continue;
        }

        const fileBuffer = await image.arrayBuffer();

        const fileExtension = image.name.split(".").pop();
        const key = `gallery/${uuidv4()}.${fileExtension}`;

        const params = {
          Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
          Key: key,
          Body: Buffer.from(fileBuffer),
          ContentType: image.type,
        };

        if (
          !process.env.NEXT_PUBLIC_S3_BUCKET_NAME ||
          !process.env.NEXT_PUBLIC_AWS_REGION
        ) {
          throw new Error("S3 configuration is missing");
        }

        const command = new PutObjectCommand(params);
        await s3Client.send(command);

        const imageUrl = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`;
        uploadedUrls.push(imageUrl);
      }

      formData.append("imageUrls", JSON.stringify({ uploadedUrls }));

      dispatch(formData);
    } catch (error) {
      console.error("Upload error: ", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center space-y-2 w-full"
    >
      <input type="hidden" name="id" value={event.id} />
      <input type="hidden" name="eventBy" value={event.eventBy} />
      <input type="hidden" name="currentCoverUrl" value={event.coverUrl} />
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
          defaultValue={event.eventBy}
          disabled
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
      <div className="mb-4 w-full md:w-1/2 flex flex-col">
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
          Image
        </label>
        <input
          className="w-full p-1.5 bg-transparent text-white border border-white"
          name="cover"
          type="file"
          accept="image/*"
        />
        <div id="price-error" aria-live="polite" aria-atomic="true">
          {state.errors?.cover &&
            state.errors.cover.map((error: string, i) => (
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
      <div className="w-full md:w-1/2">
        <div className="border-t border-white my-4"></div>
      </div>
      {eventIsSxnics && (
        <MultipleImageUpload
          existingImages={existingImages.map((imageUrl) => ({ url: imageUrl }))}
          onExistingImageRemove={async (_, imageUrl) => {
            await deleteImage(imageUrl);
          }}
          onChange={(files, existingImages) => {
            setSelectedImages(files);
            setExisitingImages(existingImages.map((image) => image.url));
          }}
          name="images"
        />
      )}
      <SubmitButton uploading={uploading}>Save</SubmitButton>
    </form>
  );
}
