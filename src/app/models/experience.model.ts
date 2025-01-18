export interface Position {
  lat: number;
  lng: number;
}

export interface Experience {
  id: string;
  name: string;
  startDateTime: string; // ISO string with date and time
  endDateTime: string;   // ISO string with date and time
  address: string;
  position: Position;
  description: string;
  hashtags: string[];
  category: string;
  pictures: string[];
  createdAt: string;
  updatedAt: string;
}
