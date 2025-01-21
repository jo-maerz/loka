import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import * as L from 'leaflet';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { ExperienceService } from '../../services/experience.service';
import { AuthService } from '../../services/auth.service';
import { Experience } from '../../models/experience.model';

import { CreateExperienceModalComponent } from '../create-experience-modal/create-experience-modal.component';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

@Component({
  selector: 'app-leaflet-map',
  templateUrl: './leaflet-map.component.html',
  styleUrls: ['./leaflet-map.component.scss'],
})
export class LeafletMapComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('drawer') drawer!: MatSidenav;

  map!: L.Map;

  experiences: Experience[] = [];
  experiencesSubscription!: Subscription;

  // For date/time filtering example
  selectedDateTime: Date = new Date();
  selectedDateTimeLocal: string = this.formatDateTime(new Date());

  // Marker map: experience.id -> Leaflet Marker
  private markerMap = new Map<number, L.Marker>();

  // The experience currently displayed in the sidebar
  selectedExperience?: Experience;

  constructor(
    private experienceService: ExperienceService,
    private dialog: MatDialog,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadLeafletIcons();
    this.initMap();

    this.experiencesSubscription = this.experienceService
      .getAllExperiences()
      .subscribe({
        next: (data) => {
          this.experiences = data;
          this.updateMarkers();
        },
        error: (err) => console.error('Error fetching experiences:', err),
      });
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
    if (this.experiencesSubscription) {
      this.experiencesSubscription.unsubscribe();
    }
  }

  loadLeafletIcons(): void {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
    });
  }

  initMap(): void {
    this.map = L.map('map').setView([50.1155, 8.6724], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    this.map.on('click', (event: L.LeafletMouseEvent) => {
      console.log('Map clicked:', event.latlng);
    });
  }

  // =================== DATE/TIME PICKER HANDLER ===================
  onDateTimeLocalChange(): void {
    if (this.selectedDateTimeLocal) {
      this.selectedDateTime = new Date(this.selectedDateTimeLocal);
      this.updateMarkers();
    }
  }

  // =================== MARKER SYNC ===================
  updateMarkers(): void {
    const selectedTimestamp = this.selectedDateTime.getTime();

    const visibleExperiences = this.experiences.filter((exp) => {
      const start = new Date(exp.startDateTime!).getTime();
      const end = new Date(exp.endDateTime!).getTime();
      return selectedTimestamp >= start && selectedTimestamp <= end;
    });

    const visibleIds = new Set<number>(visibleExperiences.map((e) => e.id!));

    for (const [id, marker] of this.markerMap.entries()) {
      if (!visibleIds.has(id)) {
        marker.remove();
        this.markerMap.delete(id);
      }
    }

    // Add or update markers for experiences that are visible
    for (const exp of visibleExperiences) {
      if (!this.markerMap.has(exp.id!)) {
        const newMarker = L.marker([
          exp.position!.lat,
          exp.position!.lng,
        ]).addTo(this.map);
        newMarker.on('click', () => this.onMarkerClick(exp));
        this.markerMap.set(exp.id!, newMarker);
      } else {
        const existingMarker = this.markerMap.get(exp.id!)!;
        existingMarker.setLatLng([exp.position!.lat, exp.position!.lng]);
      }
    }
  }

  onMarkerClick(exp: Experience): void {
    console.log('Marker clicked for experience:', exp.name);
    this.selectedExperience = exp;
    this.drawer.open();
  }

  closeSidebar(): void {
    this.drawer.close();
    this.selectedExperience = undefined;
  }

  // =================== CREATE EXPERIENCE DIALOG ===================
  openCreateModal(): void {
    const dialogRef = this.dialog.open(CreateExperienceModalComponent, {
      width: '600px',
      data: {},
    });

    dialogRef.afterClosed().subscribe((newExp: Experience) => {
      if (newExp) {
        console.log(newExp);
        this.experienceService.createExperience(newExp).subscribe({
          next: () => this.refreshMap(),
          error: (err) => console.error('Failed to create:', err),
        });
      }
    });
  }

  // Called after editing/deleting from the sidebar => refresh the experiences
  refreshMap(): void {
    this.experienceService.getAllExperiences().subscribe({
      next: (data) => {
        this.experiences = data;
        this.updateMarkers();
      },
      error: (err) => console.error('Error refreshing experiences:', err),
    });
  }

  // =================== UTIL: FORMAT DATE/TIME ===================
  formatDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const mins = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${mins}`;
  }
}
