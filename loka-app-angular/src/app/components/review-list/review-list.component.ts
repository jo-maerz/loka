import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { ReviewService } from '../../services/review.service';
import { Review } from '../../models/review.model';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteModalComponent } from '../confirm-delete-modal/confirm-delete-modal.component';
import { EditReviewModalComponent } from '../../edit-review-modal/edit-review-modal.component';

@Component({
  selector: 'app-review-list',
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.scss'],
})
export class ReviewListComponent implements OnInit, OnChanges {
  @Input() experienceId!: number;
  @Input() reloadKey: number = 0; // This input triggers a reload when its value changes.
  @Output() reviewChanged = new EventEmitter<void>(); // Emit event on changes
  reviews: Review[] = [];
  errorMessage: string = '';

  constructor(
    private reviewService: ReviewService,
    public authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // If reloadKey changes (and it's not the first change), reload the reviews.
    if (changes['reloadKey'] && !changes['reloadKey'].firstChange || changes['experienceId']) {
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
        this.errorMessage =
          err.error?.message || 'An error occurred while fetching reviews.';
      },
    });
  }

  isCurrentUser(reviewerId: string): boolean {
    return this.authService.userId === reviewerId;
  }

  editReview(review: Review): void {
    const dialogRef = this.dialog.open(EditReviewModalComponent, {
      width: '600px',
      data: { ...review }, // Pass a copy of the review to edit
    });

    dialogRef.afterClosed().subscribe((updatedReview: Review) => {
      if (updatedReview) {
        // Call your review service to update the review with the updated data
        this.reviewService
          .updateReview(updatedReview.id!, {
            stars: updatedReview.stars,
            text: updatedReview.text,
          })
          .subscribe(() => {
            this.loadReviews();
            this.reviewChanged.emit();
          });
      }
    });
  }

  deleteReview(review: Review): void {
    const dialogRef = this.dialog.open(ConfirmDeleteModalComponent, {
      width: '400px',
      data: { confirmMessage: 'Do you really want to delete this review?' },
    });

    dialogRef.afterClosed().subscribe((confirmDelete: boolean) => {
      if (confirmDelete) {
        this.reviewService.deleteReview(review.id!).subscribe(() => {
          this.loadReviews();
          this.reviewChanged.emit();
        });
      }
    });
  }
}
