export type Category =
  | 'Food Festival'
  | 'Art Installation'
  | 'Concert'
  | 'Outdoor Gathering'
  | 'Flea Market';

export interface Position {
  lat: number;
  lng: number;
}

export interface Experience {
  id?: number;
  name: string;
  startDateTime: string; // ISO string with date and time
  endDateTime: string; // ISO string with date and time
  address: string;
  position: Position;
  description?: string;
  hashtags?: string[];
  category?: Category;
  pictures?: string[];
  createdAt?: string;
  updatedAt?: string;
}
