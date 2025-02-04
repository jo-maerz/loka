export interface Review {
  id: number;
  stars: number;
  text?: string;
  userId: number;
  reviewDate: string;
  reviewer: Reviwer;
}

interface Reviwer {
  firstName: string;
  lastName: string;
  email: string;
}
