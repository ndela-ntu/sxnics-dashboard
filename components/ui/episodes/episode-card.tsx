"use client";

import { IEpisode } from "@/models/episode";
import Image from "next/image";
import { useState, useRef } from "react";
import { Play, Pause, EllipsisVertical } from "lucide-react";
import EllipsisMenu from "./ellipsis-menu";

export default function EpisodeCard({ episode }: { episode: IEpisode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  //

  return (
    <div className="flex justify-between border w-full md:p-4 items-center space-x-5">
      <div className="w-full flex flex-row items-center space-x-2">
        <div className="w-1/4 md:1/6 lg:w-1/12 aspect-square relative overflow-hidden rounded-full">
          <Image
            src={episode.imageUrl}
            alt="Image of episode"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
          <button
            className="flex items-center justify-center absolute inset-0 m-auto w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-white"
            onClick={togglePlayPause}
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
            <span className="sr-only">
              {isPlaying ? "Pause" : "Play"} audio
            </span>
          </button>
        </div>
        <audio
          ref={audioRef}
          src={episode.audioUrl}
          className="hidden"
          onEnded={() => setIsPlaying(false)}
        />
        <label className="overflow-ellipsis">{episode.name}</label>
      </div>
      <EllipsisMenu id={episode.id} />
    </div>
  );
}
