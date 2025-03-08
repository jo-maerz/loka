import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Review } from '../models/review.model';

@Component({
  selector: 'app-edit-review-modal',
  templateUrl: './edit-review-modal.component.html',
  styleUrls: ['./edit-review-modal.component.scss'],
})
export class EditReviewModalComponent {
  editReviewForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EditReviewModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Review,
    private fb: FormBuilder
  ) {
    // Initialize the form with the current review data.
    this.editReviewForm = this.fb.group({
      text: [data.text, Validators.required],
      stars: [
        data.stars,
        [Validators.required, Validators.min(1), Validators.max(5)],
      ],
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.editReviewForm.valid) {
      // Create an updated review object merging the original data and the form values.
      const updatedReview: Review = {
        ...this.data,
        ...this.editReviewForm.value,
      };
      this.dialogRef.close(updatedReview);
    }
  }
}
