import { IEpisode } from "@/models/episode";
import { IMergedEpisode } from "@/models/merged_episode";
import { IVideoEpisode } from "@/models/video_episode";

export const mergeEpisodes = (
  videoEpisodes: IVideoEpisode[],
  audioEpisodes: IEpisode[]
): IMergedEpisode[] => {
  const merged = [
    ...videoEpisodes.map((video) => ({
      ...video,
      mediaUrl: video.videoUrl,
      type: "video" as const,
    })),
    ...audioEpisodes.map((audio) => ({
      ...audio,
      mediaUrl: audio.audioUrl,
      type: "audio" as const,
    })),
  ];

  return merged.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};
