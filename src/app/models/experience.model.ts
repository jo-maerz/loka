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
  fileName?: string;
  filePath: string;
  file?: File;
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
