export interface IVideoEpisode {
  id: number;
  created_at: string;
  name: string;
  artistId: number;
  description: string;
  imageUrl: string;
  videoUrl: string;
  tag: string;
  artists: {
    id: number;
    name: string;
    bio: string;
    imageUrl: string;
    socialLinks: any;
  };
}
