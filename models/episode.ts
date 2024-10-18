export interface IEpisode {
  id: number;
  name: string;
  artistId: number;
  description: string;
  imageUrl: string;
  audioUrl: string;
  tag: string;
  artists: {
    id: number;
    name: string;
    bio: string;
    imageUrl: string;
    socialLinks: any;
  };
}
