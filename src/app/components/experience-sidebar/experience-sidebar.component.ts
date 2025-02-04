// experience-sidebar.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Experience } from '../../models/experience.model';
import { ExperienceService } from '../../services/experience.service';
import { CreateExperienceModalComponent } from '../create-experience-modal/create-experience-modal.component';
import { ConfirmDeleteModalComponent } from '../confirm-delete-modal/confirm-delete-modal.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-experience-sidebar',
  templateUrl: './experience-sidebar.component.html',
  styleUrls: ['./experience-sidebar.component.scss'],
})
export class ExperienceSidebarComponent implements OnInit {
  @Input() experience!: Experience;

  @Output() refreshMap = new EventEmitter<void>();
  @Output() closeSidebar = new EventEmitter<void>();
  selectedFiles: File[] = [];

  constructor(
    private experienceService: ExperienceService,
    private dialog: MatDialog,
    public authService: AuthService
  ) {}

  ngOnInit(): void {}

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

  onFileSelect(event: any): void {
    this.selectedFiles = Array.from(event.target.files);
  }
}
