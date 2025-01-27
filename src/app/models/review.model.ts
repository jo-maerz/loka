export interface Review {
  id?: number;
  userId: number;
  experienceId: number;
  reviewDate: string;
  rating: number;
  description: string;
}
