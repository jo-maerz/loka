import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReviewService } from '../../services/review.service';
import { Review } from '../../models/review.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-review-form',
  templateUrl: './review-form.component.html',
  styleUrls: ['./review-form.component.scss'],
})
export class ReviewFormComponent implements OnInit, OnChanges {
  @Input() experienceId!: number;
  reviewForm!: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private reviewService: ReviewService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['experienceId'] && !changes['experienceId'].firstChange) {
      this.reviewForm.reset({ stars: 5, text: '' });
      this.errorMessage = '';
    }
  }

  initializeForm(): void {
    this.reviewForm = this.fb.group({
      stars: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      text: ['', [Validators.required, Validators.maxLength(1000)]],
    });
  }

  onSubmit(): void {
    if (this.reviewForm.invalid) {
      return;
    }

    const review: Partial<Review> = {
      stars: this.reviewForm.value.stars,
      text: this.reviewForm.value.text,
    };

    this.reviewService
      .createReview(this.experienceId, review as Review)
      .subscribe({
        next: (res) => {
          alert('Review submitted successfully!');
          // todo: refresh the reviews list
          this.reviewForm.reset({ stars: 5, text: '' });
        },
        error: (err) => {
          this.errorMessage =
            err.error || 'An error occurred while submitting the review.';
        },
      });
  }
}
