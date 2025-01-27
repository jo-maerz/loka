import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from '../models/review.model';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private apiUrl = '/api/reviews';

  constructor(private http: HttpClient) {}

  createReview(review: Review): Observable<Review> {
    let params = new HttpParams()
      .set('experienceId', review.experienceId.toString())
      .set('rating', review.rating.toString())
      .set('description', review.description);
    // Assuming userId is handled via authentication and not sent as a parameter
    return this.http.post<Review>(`${this.apiUrl}`, null, { params });
  }

  getReviewById(id: number): Observable<Review> {
    return this.http.get<Review>(`${this.apiUrl}/${id}`);
  }

  getReviewsByExperience(experienceId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/experience/${experienceId}`);
  }

  getReviewsByUser(userId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/user/${userId}`);
  }

  updateReview(review: Review): Observable<Review> {
    let params = new HttpParams()
      .set('rating', review.rating.toString())
      .set('description', review.description);
    // Assuming userId is handled via authentication and not sent as a parameter
    return this.http.put<Review>(`${this.apiUrl}/${review.id}`, null, {
      params,
    });
  }

  deleteReview(id: number): Observable<void> {
    // Assuming userId is handled via authentication and not sent as a parameter
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
