export type Category =
  | 'Food Festival'
  | 'Art Installation'
  | 'Concert'
  | 'Outdoor Gathering'
  | 'Flea Market'
  | 'Exhibition'
  | 'Workshop'
  | 'Networking Event'
  | 'Tech Talk'
  | 'Others';

export interface Position {
  lat: number;
  lng: number;
}

export interface ExperienceImage {
  id?: number;
  name?: string;
  type?: string;
  data?: ArrayBuffer; // From backend response
  preview?: string; // Frontend preview (Base64)
  file?: File; // Frontend upload (File object)
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
  images?: ExperienceImage[];
}
