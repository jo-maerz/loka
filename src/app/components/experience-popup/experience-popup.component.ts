import { Component, Input, OnInit } from '@angular/core';
import { Experience } from '../../models/experience.model';
import { ExperienceService } from '../../services/experience.service';
import { CreateExperienceModalComponent } from '../create-experience-modal/create-experience-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { LeafletMapComponent } from '../leaflet-map/leaflet-map.component';
import L from 'leaflet';

@Component({
  selector: 'app-experience-popup',
  templateUrl: './experience-popup.component.html',
  styleUrls: ['./experience-popup.component.scss'],
})
export class ExperiencePopupComponent implements OnInit {
  @Input() experience!: Experience;

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
    const start = new Date(this.experience.startDateTime);
    const end = new Date(this.experience.endDateTime);
    return `${start.toLocaleString()} - ${end.toLocaleString()}`;
  }
  // Method to edit the experience
  openEditModal(): void {
    // Close the Leaflet popup
    const popup = L.DomUtil.get('leaflet-popup');
    if (popup) {
      const map = this.leafletMapComponent.map; // Ensure you have access to the map instance
      map.closePopup();
    }

    this.leafletMapComponent.openModal(this.experience);
  }

  // Method to delete the experience
  deleteExperience(): void {
    if (confirm('Are you sure you want to delete this experience?')) {
      this.experienceService.deleteExperience(this.experience.id!!).subscribe({
        next: () => {
          alert('Experience deleted successfully!');
          window.location.reload(); // Example for simplicity
        },
        error: (error) => {
          alert('Failed to delete the experience.');
          console.error(error);
        },
      });
    }
  }
}
