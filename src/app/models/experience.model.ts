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
  startDateTime: Date;
  endDateTime: Date;
  address: string;
  position: Position;
  description?: string;
  hashtags?: string[];
  category?: Category;
  images?: ExperienceImage[];
  createdBy?: string;
}
