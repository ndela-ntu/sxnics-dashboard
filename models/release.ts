export interface IRelease {
    id: number;
    artist: string;
    name: string;
    imageUrl: string;
    purchaseLink: string;
    about: string;
    type: 'Digital' | 'Vinyl' | 'CD'
    tag: string;
}