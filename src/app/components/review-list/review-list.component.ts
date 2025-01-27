import { Component, OnInit, Input } from '@angular/core';
import { ReviewService } from '../../services/review.service';
import { Review } from '../../models/review.model';

@Component({
  selector: 'app-review-list',
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.scss'],
})
export class ReviewListComponent implements OnInit {
  @Input() experienceId!: number;
  reviews: Review[] = [];
  errorMessage: string = '';

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.reviewService.getReviewsByExperience(this.experienceId).subscribe({
      next: (res) => {
        this.reviews = res;
      },
      error: (err) => {
        this.errorMessage =
          err.error || 'An error occurred while fetching reviews.';
      },
    });
  }
}
