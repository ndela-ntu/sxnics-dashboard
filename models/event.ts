export interface IEvent {
  id: number;
  eventBy: string;
  ticketLink: string;
  about: string;
  location: string;
  coverUrl: string;
  sxnicsEventGallery?: string[];
  name: string;
  eventDate: string;
}
