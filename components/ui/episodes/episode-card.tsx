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
    <div className="flex justify-between border w-full md:p-4 items-center space-x-5 ">
      <div className="w-full flex flex-row items-center justify-between ">
        <div className="flex flex-row w-full items-center space-x-2 md:space-x-10">
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
          <div className="flex-2">
            <div className="flex flex-col ">
              <label className="overflow-ellipsis text-sm md:text-base">
                {episode.name}
              </label>
              <label className="overflow-ellipsis text-sm md:text-sm font-bold">
                {episode.artists.name}
              </label>
              <span className="bg-white text-xs md:text-sm text-black max-w-fit mt-1 p-1">
                {episode.tag}
              </span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2 bg-white text-black p-1 rounded-xl">
          <span>Plays:</span>
          <span>{episode.plays}</span>
        </div>
      </div>
      <EllipsisMenu id={episode.id} />
    </div>
  );
}
