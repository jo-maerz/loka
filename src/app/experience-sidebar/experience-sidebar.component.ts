import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Experience } from '../models/experience.model';
import { ExperienceService } from '../services/experience.service';
import { CreateExperienceModalComponent } from '../components/create-experience-modal/create-experience-modal.component';
import { ConfirmDeleteModalComponent } from '../confirm-delete-modal/confirm-delete-modal.component';

@Component({
  selector: 'app-experience-sidebar',
  templateUrl: './experience-sidebar.component.html',
  styleUrls: ['./experience-sidebar.component.scss'],
})
export class ExperienceSidebarComponent implements OnInit {
  @Input() experience!: Experience;

  /**
   * Parent (LeafletMapComponent) can listen for these events:
   * - refreshMap: re-fetch experiences after an edit/delete
   * - closeSidebar: close the sidenav
   */
  @Output() refreshMap = new EventEmitter<void>();
  @Output() closeSidebar = new EventEmitter<void>();

  constructor(
    private experienceService: ExperienceService,
    private dialog: MatDialog
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

    dialogRef.afterClosed().subscribe((updated: Experience) => {
      if (updated) {
        this.experienceService
          .updateExperience(updated.id!, updated)
          .subscribe(() => {
            this.refreshMap.emit();
          });
      }
    });
  }

  openDeleteModal(): void {
    const dialogRef = this.dialog.open(ConfirmDeleteModalComponent, {
      width: '400px',
      data: {
        confirmMessage: 'Do you really want to delete this experience?',
      },
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
}
