"use client";

import { EpisodeState, createEpisode } from "@/app/actions";
import SubmitButton from "@/components/submit-button";
import { IArtist } from "@/models/artist";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { string } from "zod";
import { v4 as uuidv4 } from "uuid";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

// Define valid field names
type FieldName =
  | "name"
  | "artistId"
  | "description"
  | "tag"
  | "image"
  | "contentUrl";

export default function CreateEpisodeForm({ artists }: { artists: IArtist[] }) {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState<EpisodeState, FormData>(
    createEpisode,
    initialState
  );

  const [episodeType, setEpisodeType] = useState<"audio" | "video">("audio");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Helper function to safely render errors with proper typing
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData(e.currentTarget);
      let contentUrl = "";
      if (episodeType === "audio") {
        const audio = formData.get("audio") as File;

        const fileName = `${uuidv4()}_${audio.name}`;
        const uploadParams = {
          Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
          Key: fileName,
          Body: Buffer.from(await audio.arrayBuffer()),
          ContentType: audio.type,
        };

        if (
          !process.env.NEXT_PUBLIC_S3_BUCKET_NAME ||
          !process.env.NEXT_PUBLIC_AWS_REGION
        ) {
          throw new Error("S3 configuration is missing");
        }

        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        const s3Url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${fileName}`;

        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 100));
        }, 1000);

        //await upload;
        clearInterval(progressInterval);
        contentUrl = s3Url;
      } else {
        contentUrl = formData.get("videoUrl") as string;
      }

      const finalFormData = new FormData();
      finalFormData.append('episodeType', episodeType);
      finalFormData.append("name", formData.get("name") as string);
      finalFormData.append("artistId", formData.get("artistId") as string);
      finalFormData.append(
        "description",
        formData.get("description") as string
      );
      finalFormData.append("tag", formData.get("tag") as string);
      finalFormData.append("image", formData.get("image") as File);
      finalFormData.append('contentUrl', contentUrl);
      // if (episodeType === 'audio') {
      //   finalFormData.append("audioUrl", contentUrl);
      // }else {
      //   finalFormData.append("videoUrl", contentUrl);
      // }
      dispatch(finalFormData);
    } catch (error) {
      console.error("Upload error: ", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      className="flex flex-col items-center justify-center space-y-2 w-full"
      onSubmit={handleSubmit}
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
          required
        />
        <div id="image-error" aria-live="polite" aria-atomic="true">
          {renderErrors("image")}
        </div>
      </div>
      <div className="mb-4 w-full md:w-1/2">
        <label>Episode Type</label>
        <select
          onChange={(e) => {
            console.log(e.target.value);
            if (e.target.value === "audio") {
              setEpisodeType("audio");
            } else {
              setEpisodeType("video");
            }
          }}
          className="p-1.5 bg-transparent border border-white w-full"
          name="episodeType"
        >
          <option className="text-black" value="audio">
            Audio
          </option>
          <option className="text-black" value="video">
            Video
          </option>
        </select>
        <div id="tag-error" aria-live="polite" aria-atomic="true">
          {renderErrors("tag")}
        </div>
      </div>
      {episodeType === "audio" ? (
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
            {renderErrors("contentUrl")}
          </div>
        </div>
      ) : (
        <div className="mb-4 w-full md:w-1/2">
          <label>Youtube URL</label>
          <input
            className="p-1.5 bg-transparent text-white border border-white w-full"
            name="videoUrl"
            type="text"
            placeholder="Youtube URL"
            required
          />
          <div id="audio-error" aria-live="polite" aria-atomic="true">
            {renderErrors("contentUrl")}
          </div>
        </div>
      )}
      <SubmitButton uploading={uploading}>Save</SubmitButton>
    </form>
  );
}
