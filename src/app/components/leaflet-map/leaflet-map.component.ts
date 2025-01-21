import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ViewContainerRef,
  ComponentRef,
  AfterViewInit,
  Injector,
  ApplicationRef,
  ComponentFactoryResolver,
  EmbeddedViewRef,
} from '@angular/core';
import * as L from 'leaflet';
import { ExperienceService } from '../../services/experience.service';
import { Experience } from '../../models/experience.model';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { CreateExperienceModalComponent } from '../create-experience-modal/create-experience-modal.component';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { ExperiencePopupComponent } from '../experience-popup/experience-popup.component';
import { AuthService } from '../../services/auth.service';
import { LoginDialogComponent } from '../../login-dialog/login-dialog.component';

@Component({
  selector: 'app-leaflet-map',
  templateUrl: './leaflet-map.component.html',
  styleUrls: ['./leaflet-map.component.scss'],
})
export class LeafletMapComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('popupHost', { read: ViewContainerRef })
  popupHost!: ViewContainerRef;

  map!: L.Map;
  selectedDateTimeLocal: string = this.formatDateTime(new Date());
  selectedDateTime: Date = new Date();

  // Instead of an array of markers, we keep a Map<experienceId, {marker, componentRef?}>
  private markerMap = new Map<
    number,
    {
      marker: L.Marker;
      componentRef?: ComponentRef<ExperiencePopupComponent>;
    }
  >();

  experiences: Experience[] = [];
  experiencesSubscription!: Subscription;

  constructor(
    private experienceService: ExperienceService,
    public dialog: MatDialog,
    private injector: Injector,
    private appRef: ApplicationRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadLeafletIcons();
    this.initMap();

    // Fetch experiences initially
    this.experiencesSubscription = this.experienceService
      .getAllExperiences()
      .subscribe({
        next: (data) => {
          this.experiences = data;
          // Synchronize markers with current experiences
          this.updateMarkers();
        },
        error: (err) => {
          console.log('Error fetching experiences: ' + err.message);
        },
      });
  }

  ngAfterViewInit(): void {
    // The popupHost is ready for component insertion (not strictly needed here)
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
    if (this.experiencesSubscription) {
      this.experiencesSubscription.unsubscribe();
    }
  }

  loadLeafletIcons(): void {
    // Delete the default _getIconUrl to override icon paths
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    // Merge new options to set correct icon paths
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
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    this.map.on('click', this.onMapClick.bind(this));
  }

  onMapClick(event: L.LeafletMouseEvent): void {
    const { lat, lng } = event.latlng;
    console.log('Clicked on main map:', lat, lng);
  }

  // =========================================================================
  // --------------  CORE LOGIC: Syncing Markers with Experiences ------------
  // =========================================================================

  /**
   * Keep markers in sync with the experiences in this.experiences,
   * respecting the selected date/time filter.
   */
  updateMarkers(): void {
    // 1) Filter experiences by the chosen date/time
    const selectedTimestamp = this.selectedDateTime.getTime();
    const visibleExperiences = this.experiences.filter((experience) => {
      const start = new Date(experience.startDateTime).getTime();
      const end = new Date(experience.endDateTime).getTime();
      return selectedTimestamp >= start && selectedTimestamp <= end;
    });

    // Turn them into a set of IDs for quick lookup
    const visibleIds = new Set<number>(visibleExperiences.map((e) => e.id!));

    // 2) Remove markers for experiences that are no longer visible
    for (const [expId, { marker, componentRef }] of this.markerMap.entries()) {
      if (!visibleIds.has(expId)) {
        // If the marker/popup exists for an experience that is no longer visible, remove it
        marker.remove(); // remove from map
        if (componentRef) {
          // detach and destroy the component
          this.appRef.detachView(componentRef.hostView);
          componentRef.destroy();
        }
        this.markerMap.delete(expId);
      }
    }

    // 3) Add or update markers for currently visible experiences
    for (const exp of visibleExperiences) {
      // If we don't already have a marker for this experience, create one
      if (!this.markerMap.has(exp.id!)) {
        const newMarker = L.marker([exp.position.lat, exp.position.lng]).addTo(
          this.map
        );

        // Attach a click event to open the ExperiencePopupComponent
        newMarker.on('click', () => {
          this.openExperiencePopup(exp.id!);
        });

        // Store it in the map
        this.markerMap.set(exp.id!, { marker: newMarker });
      } else {
        // If the marker already exists, update position if needed
        const entry = this.markerMap.get(exp.id!)!;
        entry.marker.setLatLng([exp.position.lat, exp.position.lng]);

        // If the popup is open, update the data in the component
        if (entry.marker.isPopupOpen() && entry.componentRef) {
          entry.componentRef.instance.experience = exp;
        }
      }
    }
  }

  /**
   * Opens (or reuses) the ExperiencePopupComponent for the given experience ID.
   */
  openExperiencePopup(experienceId: number): void {
    const entry = this.markerMap.get(experienceId);
    if (!entry) return; // safety check

    // If we already created a componentRef for this marker,
    // just re-open the popup if it's not open, and reassign data.
    if (entry.componentRef) {
      const marker = entry.marker;
      const compRef = entry.componentRef;

      // Update the data (in case it changed)
      const exp = this.experiences.find((e) => e.id === experienceId);
      if (exp) {
        compRef.instance.experience = exp;
      }

      // If popup is closed, open it again
      if (!marker.isPopupOpen()) {
        marker.openPopup();
      }

      return;
    }

    // Otherwise, create a brand-new popup with the dynamic component
    const exp = this.experiences.find((e) => e.id === experienceId);
    if (!exp) return;

    // Create a container div
    const popupDiv = document.createElement('div');

    // Dynamically create the component
    const componentRef: ComponentRef<ExperiencePopupComponent> =
      this.componentFactoryResolver
        .resolveComponentFactory(ExperiencePopupComponent)
        .create(this.injector);

    componentRef.instance.experience = exp;

    // Attach the component to the app
    this.appRef.attachView(componentRef.hostView);

    // Get the component's DOM node
    const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;
    popupDiv.appendChild(domElem);

    // Bind the popup
    entry.marker.bindPopup(popupDiv).openPopup();

    // Store the componentRef so we can reuse it / update it
    entry.componentRef = componentRef;

    // If you truly never want the popup to close, you could avoid listening to "popupclose".
    // But if you'd like to let the user close it:
    entry.marker.on('popupclose', () => {
      // If you do NOT want to destroy the component, do nothing here.
      // The user can re-click the marker to reopen it.
      // (If you do want to destroy it, you can re-attach it again next time.)
      //
      // this.appRef.detachView(componentRef.hostView);
      // componentRef.destroy();
      // entry.componentRef = undefined;
    });
  }

  // =========================================================================
  // -----------------------  Date/Time Handling  ----------------------------
  // =========================================================================

  onDateTimeLocalChange(): void {
    if (this.selectedDateTimeLocal) {
      this.selectedDateTime = new Date(this.selectedDateTimeLocal);
      console.log('Selected date and time changed to:', this.selectedDateTime);
      this.updateMarkers();
    }
  }

  // =========================================================================
  // -------------------  Create / Update Experience Logic -------------------
  // =========================================================================

  openModal(existingExperience?: Experience): void {
    const dialogRef = this.dialog.open(CreateExperienceModalComponent, {
      width: '600px',
      data: existingExperience ? { ...existingExperience } : null,
    });

    dialogRef.afterClosed().subscribe((result: Experience) => {
      if (result) {
        if (existingExperience) {
          // Update existing experience
          this.experienceService
            .updateExperience(result.id!!, result)
            .subscribe(() => {
              this.refreshMap(); // Refresh the map after editing
            });
        } else {
          // Create new experience
          this.experienceService.createExperience(result).subscribe(() => {
            this.refreshMap(); // Refresh the map after creation
          });
        }
      }
    });
  }

  refreshMap(): void {
    this.experienceService.getAllExperiences().subscribe({
      next: (data) => {
        this.experiences = data;
        // Re-run marker sync (this will update or remove or add markers as needed)
        this.updateMarkers();
      },
      error: (err) => {
        console.log('Error fetching experiences: ' + err.message);
      },
    });
  }

  handleExperienceCreated(newExperience: Experience): void {
    this.experienceService.createExperience(newExperience);
  }

  // =========================================================================
  // -------------------------  Utility Methods  -----------------------------
  // =========================================================================

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}
