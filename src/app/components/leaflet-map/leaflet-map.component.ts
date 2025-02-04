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
import { CITIES } from '../../models/constants';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';

@Component({
  selector: 'app-leaflet-map',
  templateUrl: './leaflet-map.component.html',
  styleUrls: ['./leaflet-map.component.scss'],
})
export class LeafletMapComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('drawer') drawer!: MatSidenav;

  // The Leaflet map instance
  map!: L.Map;

  // Experiences array
  experiences: Experience[] = [];
  experiencesSubscription!: Subscription;

  // For date filtering
  selectedDate: Date = new Date();

  // City dropdown array + selected city
  cities = CITIES;
  selectedCity = this.cities[0]; // default to the first city, e.g., Frankfurt

  // Marker map: experience.id -> Leaflet Marker
  private markerMap = new Map<number, L.Marker>();

  // The experience currently displayed in the sidebar
  selectedExperience?: Experience;

  constructor(
    private experienceService: ExperienceService,
    private dialog: MatDialog,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadLeafletIcons();
    this.initMap();

    // Subscribe to experiences
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

  // =============== MAP SETUP ===============
  loadLeafletIcons(): void {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
    });
  }

  initMap(): void {
    // By default, center on the selectedCity coords
    this.map = L.map('map').setView(
      [this.selectedCity.lat, this.selectedCity.lng],
      16
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    this.map.on('click', (event: L.LeafletMouseEvent) => {
      //console.log('Map clicked:', event.latlng);
    });
  }

  // =============== CITY DROPDOWN HANDLER ===============
  onCityChange(city: { name: string; lat: number; lng: number }): void {
    this.selectedCity = city;
    // Re-center the map on the newly selected city
    if (this.map) {
      this.map.setView([city.lat, city.lng], 16);
      this.closeSidebar();
    }
  }

  // =============== DATE HANDLER ===============
  onDateChange(): void {
    this.updateMarkers();
    this.closeSidebar();
  }

  // =============== MARKER SYNC & SIDEBAR ===============
  updateMarkers(): void {
    // Extract the selected date (year, month, day)
    const selectedYear = this.selectedDate.getFullYear();
    const selectedMonth = this.selectedDate.getMonth();
    const selectedDay = this.selectedDate.getDate();

    // Filter experiences by selected date
    const visibleExperiences = this.experiences.filter((exp) => {
      const expStart = new Date(exp.startDateTime!);
      const expEnd = new Date(exp.endDateTime!);

      // Check if the selected date is within the experience's date range
      return (
        (expStart.getFullYear() < selectedYear ||
          (expStart.getFullYear() === selectedYear &&
            expStart.getMonth() < selectedMonth) ||
          (expStart.getFullYear() === selectedYear &&
            expStart.getMonth() === selectedMonth &&
            expStart.getDate() <= selectedDay)) &&
        (expEnd.getFullYear() > selectedYear ||
          (expEnd.getFullYear() === selectedYear &&
            expEnd.getMonth() > selectedMonth) ||
          (expEnd.getFullYear() === selectedYear &&
            expEnd.getMonth() === selectedMonth &&
            expEnd.getDate() >= selectedDay))
      );
    });

    // Convert visible experiences to a Set of IDs
    const visibleIds = new Set<number>(visibleExperiences.map((e) => e.id!));

    // Remove markers that are no longer visible
    for (const [id, marker] of this.markerMap.entries()) {
      if (!visibleIds.has(id)) {
        marker.remove();
        this.markerMap.delete(id);
      }
    }

    // Add markers for new visible experiences
    for (const exp of visibleExperiences) {
      if (!this.markerMap.has(exp.id!)) {
        const newMarker = L.marker([
          exp.position!.lat,
          exp.position!.lng,
        ]).addTo(this.map);
        newMarker.on('click', () => this.onMarkerClick(exp));
        this.markerMap.set(exp.id!, newMarker);
      }
      // If marker exists, no action needed since we already set its position
    }
  }

  onMarkerClick(exp: Experience): void {
    //console.log('Marker clicked for experience:', exp.name);
    this.selectedExperience = exp;
    this.drawer.open();
  }

  closeSidebar(): void {
    this.drawer.close();
    this.selectedExperience = undefined;
  }

  // =============== CREATE EXPERIENCE ===============
  openCreateModal(): void {
    const dialogRef = this.dialog.open(CreateExperienceModalComponent, {
      width: '600px',
      data: {},
    });

    dialogRef
      .afterClosed()
      .subscribe((result: { experience: Experience; files: File[] }) => {
        if (result) {
          const { id, images, ...experienceDto } = result.experience;
          this.experienceService
            .createExperience(experienceDto, result.files)
            .subscribe({
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

  openLoginModal() {
    const dialogRef = this.dialog.open(LoginDialogComponent, {
      width: '600px',
      data: {},
    });
  }

  logout() {
    this.authService.logout();
  }
}
