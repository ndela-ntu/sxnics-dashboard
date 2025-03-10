import { extractYouTubeVideoId } from "@/lib/extract_youtube_id";

export const YouTubeEmbed = ({ videoUrl }: { videoUrl: string }) => {
  const videoId = extractYouTubeVideoId(videoUrl);

  return videoId ? (
    <iframe
      width="560"
      height="315"
      src={`https://www.youtube.com/embed/${videoId}`}
      title="YouTube video player"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    ></iframe>
  ) : (
    <p>Invalid YouTube URL</p>
  );
};
