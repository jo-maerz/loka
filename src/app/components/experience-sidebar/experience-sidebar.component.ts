import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Experience } from '../../models/experience.model';
import { ExperienceService } from '../../services/experience.service';
import { CreateExperienceModalComponent } from '../create-experience-modal/create-experience-modal.component';
import { ConfirmDeleteModalComponent } from '../confirm-delete-modal/confirm-delete-modal.component';
import { AuthService } from '../../services/auth.service';
import { ReviewService } from '../../services/review.service';
import { Review } from '../../models/review.model';

@Component({
  selector: 'app-experience-sidebar',
  templateUrl: './experience-sidebar.component.html',
  styleUrls: ['./experience-sidebar.component.scss'],
})
export class ExperienceSidebarComponent implements OnInit {
  @Input() experience!: Experience;
  @Input() isOpen: boolean = false; // (Optional) If your container toggles the sidebar via an input, add:
  @Output() refreshMap = new EventEmitter<void>();
  @Output() closeSidebar = new EventEmitter<void>();
  userHasReviewed: boolean = false;
  reloadKey: number = 0;

  constructor(
    private experienceService: ExperienceService,
    private reviewService: ReviewService,
    private dialog: MatDialog,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.experience?.id) {
      this.refreshReviews();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // If the sidebar open state changes to "open", re‑fetch the reviews.
    if (changes['isOpen'] && changes['isOpen'].currentValue === true) {
      this.refreshReviews();
    }
  }

  get formattedDateRange(): string {
    if (!this.experience.startDateTime || !this.experience.endDateTime) {
      return '';
    }
    const start = new Date(this.experience.startDateTime);
    const end = new Date(this.experience.endDateTime);
    return `${start.toLocaleString()} - ${end.toLocaleString()}`;
  }

  openEditModal(): void {
    const dialogRef = this.dialog.open(CreateExperienceModalComponent, {
      width: '600px',
      data: { ...this.experience },
    });

    dialogRef
      .afterClosed()
      .subscribe((result: { experience: Experience; files: File[] }) => {
        if (result) {
          const { id, images, ...experienceDto } = result.experience;
          this.experienceService
            .updateExperience(
              result.experience.id!,
              experienceDto,
              result.files
            )
            .subscribe(() => {
              this.refreshMap.emit();
            });
        }
      });
  }

  openDeleteModal(): void {
    const dialogRef = this.dialog.open(ConfirmDeleteModalComponent, {
      width: '400px',
      data: { confirmMessage: 'Do you really want to delete this experience?' },
    });

    dialogRef.afterClosed().subscribe((confirmDelete: boolean) => {
      if (confirmDelete) {
        this.deleteExperience();
      }
    });
  }

  deleteExperience(): void {
    this.experienceService
      .deleteExperience(this.experience.id!)
      .subscribe(() => {
        this.refreshMap.emit();
        this.closeSidebar.emit();
      });
  }

  // Called when a review is submitted/edited/deleted.
  refreshReviews(): void {
    // Update the reloadKey so the review list knows to re-load.
    this.reloadKey++;

    // Optionally, re-check whether the user has already reviewed.
    this.reviewService.getReviewsByExperience(this.experience.id!).subscribe({
      next: (reviews) => {
        this.userHasReviewed = reviews.some(
          (review) => review.userId.toString() === this.authService.userId
        );
      },
      error: (err) => {
        console.error('Error refreshing reviews:', err);
      },
    });
  }

  // This method is called when the review form emits the reviewSubmitted event.
  onReviewSubmitted(): void {
    this.refreshReviews();
  }

  // This method can also be called when a review is deleted or edited.
  onReviewChanged(): void {
    this.refreshReviews();
  }
}
