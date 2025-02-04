import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from '../models/review.model';
import { environment } from '../environment';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  getReviewsByExperience(experienceId: number): Observable<Review[]> {
    return this.http.get<Review[]>(
      `${this.apiUrl}/experiences/${experienceId}`
    );
  }

  createReview(
    experienceId: number,
    review: Partial<Review>
  ): Observable<Review> {
    return this.http.post<Review>(
      `${this.apiUrl}/experiences/${experienceId}`,
      review
    );
  }

  updateReview(review: Review): Observable<Review> {
    return this.http.put<Review>(`${this.apiUrl}/${review.id}`, review);
  }

  deleteReview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
