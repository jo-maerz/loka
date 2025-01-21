import { Component, Input, OnInit } from '@angular/core';
import { Experience } from '../../models/experience.model';
import { ExperienceService } from '../../services/experience.service';
import { CreateExperienceModalComponent } from '../create-experience-modal/create-experience-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { LeafletMapComponent } from '../leaflet-map/leaflet-map.component';
import L from 'leaflet';
import { ConfirmDeleteModalComponent } from '../../confirm-delete-modal/confirm-delete-modal.component';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-experience-popup',
  templateUrl: './experience-popup.component.html',
  styleUrls: ['./experience-popup.component.scss'],
})
export class ExperiencePopupComponent implements OnInit {
  @Input() experience!: Experience;

  deleteDialogRef!: any;

  constructor(
    private experienceService: ExperienceService,
    private dialog: MatDialog,
    private leafletMapComponent: LeafletMapComponent
  ) {}

  ngOnInit(): void {}

  /**
   * Formats the start and end date-times for display
   */
  get formattedDateRange(): string {
    const start = new Date(this.experience.startDateTime!);
    const end = new Date(this.experience.endDateTime!);
    return `${start.toLocaleString()} - ${end.toLocaleString()}`;
  }
  // Method to edit the experience
  openEditModal(): void {
    // Close the Leaflet popup
    const popup = L.DomUtil.get('leaflet-popup');
    if (popup) {
      const map = this.leafletMapComponent.map;
      map.closePopup();
    }

    // this.leafletMapComponent.openCreateModal(this.experience);
  }

  // Method to delete the experience
  openDeleteModal(): void {
    this.deleteDialogRef = this.dialog.open(ConfirmDeleteModalComponent, {
      width: '400px',
      data: {
        confirmMessage: 'Do you really want to delete this experience?',
      },
    });
    this.deleteDialogRef.afterClosed().subscribe((confirmDelete: boolean) => {
      if (!confirmDelete) return;
      this.deleteExperience();
    });
  }

  deleteExperience() {
    this.experienceService.deleteExperience(this.experience.id!!).subscribe(
      (result) => {
        // success code ...
        // remove this.deleteDialogRef.close();
        // do your success handling here
      },
      (error) => {
        // handle error
      }
    );
  }
}
