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
import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

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

  map!: L.Map;
  experiences: Experience[] = [];
  experiencesSubscription!: Subscription;

  cities = CITIES;
  selectedCity = this.cities[0];
  previousCity = this.selectedCity;

  startDate!: Date;
  endDate!: Date;

  dateError: string | null = null;

  categories: string[] = [
    'Concert',
    'Art Installation',
    'Food Festival',
    'Outdoor Gathering',
    'Flea Market',
    'Exhibition',
    'Workshop',
    'Networking Event',
    'Tech Talk',
    'Others',
  ];
  selectedCategory: string | null = null;

  private markerMap = new Map<number, L.Marker>();
  selectedExperience?: Experience;

  matcher: ErrorStateMatcher = {
    isErrorState: (
      control: FormControl | null,
      form: FormGroupDirective | NgForm | null
    ): boolean => {
      return !!this.dateError;
    },
  };

  constructor(
    private experienceService: ExperienceService,
    private dialog: MatDialog,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadLeafletIcons();
    this.initMap();

    this.startDate = new Date();
    this.endDate = new Date();
    this.endDate.setDate(this.endDate.getDate() + 30);

    this.fetchExperiencesFiltered();
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
    this.map = L.map('map').setView(
      [this.selectedCity.lat, this.selectedCity.lng],
      16
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    this.map.on('click', () => {
      this.closeSidebar();
    });
  }

  onDateChange(changedField: 'start' | 'end'): void {
    this.dateError = null;
    if (this.startDate && this.endDate) {
      if (this.endDate < this.startDate) {
        this.dateError =
          'End Date cannot be before Start Date. Please correct the dates.';
      } else {
        this.onFilterChange();
      }
    }
  }

  onFilterChange(): void {
    if (this.selectedCity !== this.previousCity) {
      this.map.setView([this.selectedCity.lat, this.selectedCity.lng], 16);
      this.previousCity = this.selectedCity;
    }
    this.fetchExperiencesFiltered();
    this.closeSidebar();
  }

  fetchExperiencesFiltered(): void {
    const cityName = this.selectedCity?.name;

    this.experiencesSubscription = this.experienceService
      .getFilteredExperiences(
        cityName,
        this.startDate,
        this.endDate,
        this.selectedCategory
      )
      .subscribe({
        next: (data) => {
          this.experiences = data;
          this.updateMarkers();
        },
        error: (err) =>
          console.error('Error fetching filtered experiences:', err),
      });
  }

  updateMarkers(): void {
    for (const [_, marker] of this.markerMap.entries()) {
      marker.remove();
    }
    this.markerMap.clear();

    for (const exp of this.experiences) {
      if (exp.id != null && exp.position) {
        const newMarker = L.marker([exp.position.lat, exp.position.lng]).addTo(
          this.map
        );
        newMarker.on('click', () => this.onMarkerClick(exp));
        this.markerMap.set(exp.id, newMarker);
      }
    }
  }

  onMarkerClick(exp: Experience): void {
    this.selectedExperience = exp;
    this.drawer.open();
  }

  closeSidebar(): void {
    this.drawer.close();
    this.selectedExperience = undefined;
  }

  openCreateModal(): void {
    const dialogRef = this.dialog.open(CreateExperienceModalComponent, {
      width: '600px',
      data: {
        city: this.selectedCity,
      },
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

  refreshMap(): void {
    this.fetchExperiencesFiltered();
  }

  openLoginModal() {
    this.dialog.open(LoginDialogComponent, {
      width: '600px',
    });
  }

  logout() {
    this.authService.logout();
  }
}
