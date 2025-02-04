import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { ReviewService } from '../../services/review.service';
import { Review } from '../../models/review.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-review-list',
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.scss'],
})
export class ReviewListComponent implements OnInit, OnChanges {
  @Input() experienceId!: number;
  reviews: Review[] = [];
  errorMessage: string = '';

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['experienceId'] && !changes['experienceId'].firstChange) {
      this.loadReviews();
    }
  }

  loadReviews(): void {
    if (!this.experienceId) {
      this.reviews = [];
      return;
    }

    this.reviewService.getReviewsByExperience(this.experienceId).subscribe({
      next: (res) => {
        this.reviews = res;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching reviews:', err);
        if (err.error instanceof ErrorEvent) {
          // Client-side or network error
          this.errorMessage = `An error occurred: ${err.error.message}`;
        } else {
          // Backend returned an unsuccessful response code
          if (typeof err.error === 'string') {
            // If the error is a simple string
            this.errorMessage = err.error;
          } else if (err.error && err.error.message) {
            // If the error has a message property
            this.errorMessage = err.error.message;
          } else {
            // Fallback message
            this.errorMessage = 'An error occurred while fetching reviews.';
          }
        }
      },
    });
  }
}
