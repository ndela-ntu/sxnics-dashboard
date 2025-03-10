export interface IMergedEpisode {
    id: number;
    created_at: string;
    name: string;
    artistId: number;
    description: string;
    imageUrl: string;
    mediaUrl: string; // Holds either videoUrl or audioUrl
    tag: string;
    type: "video" | "audio"; // To differentiate between the types
    artists: {
      id: number;
      name: string;
      bio: string;
      imageUrl: string;
      socialLinks: any;
    };
    plays?: number; // Only applicable to audio episodes
  }
  