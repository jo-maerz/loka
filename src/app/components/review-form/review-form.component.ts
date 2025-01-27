// review-form.component.ts
import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReviewService } from '../../services/review.service';
import { Review } from '../../models/review.model';

@Component({
  selector: 'app-review-form',
  templateUrl: './review-form.component.html',
  styleUrls: ['./review-form.component.scss'],
})
export class ReviewFormComponent implements OnInit {
  @Input() experienceId!: number;
  reviewForm!: FormGroup;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.reviewForm = this.fb.group({
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
    });
  }

  onSubmit(): void {
    if (this.reviewForm.invalid) {
      return;
    }

    const review: Review = {
      experienceId: this.experienceId,
      rating: this.reviewForm.value.rating,
      description: this.reviewForm.value.description,
      //TODO: add userId from user service
      userId: 0,
      reviewDate: '',
    };

    this.reviewService.createReview(review).subscribe({
      next: (res) => {
        alert('Review submitted successfully!');
        // Optionally, refresh the reviews list or reset the form
        this.reviewForm.reset({ rating: 5, description: '' });
      },
      error: (err) => {
        this.errorMessage =
          err.error || 'An error occurred while submitting the review.';
      },
    });
  }
}
