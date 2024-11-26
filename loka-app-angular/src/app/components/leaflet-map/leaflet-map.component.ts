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
  markers: L.Marker[] = [];
  experiences: Experience[] = [];
  experiencesSubscription!: Subscription;

  constructor(
    private experienceService: ExperienceService,
    public dialog: MatDialog,
    private injector: Injector,
    private appRef: ApplicationRef,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {}

  ngOnInit(): void {
    this.loadLeafletIcons();
    this.initMap();
    this.updateMarkers();

    this.experiencesSubscription =
      this.experienceService.experiences$.subscribe((data) => {
        this.experiences = data;
        // Remove existing markers before adding new ones
        this.clearMarkers();
        this.updateMarkers();
      });
  }

  ngAfterViewInit(): void {
    // The popupHost is ready for component insertion
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

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
    if (this.experiencesSubscription) {
      this.experiencesSubscription.unsubscribe();
    }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0'); // Months are zero-based
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0'); // Months are zero-based
    const day = `${date.getDate()}`.padStart(2, '0');
    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  initMap(): void {
    this.map = L.map('map').setView([50.1155, 8.6724], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    // Optional: Handle map click events
    this.map.on('click', this.onMapClick.bind(this));
  }

  onMapClick(event: L.LeafletMouseEvent): void {
    const { lat, lng } = event.latlng;
    console.log('Clicked on main map:', lat, lng);
    // Optional: Handle main map clicks if needed
  }

  openModal(): void {
    const dialogRef = this.dialog.open(CreateExperienceModalComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.experienceService.addExperience(result);
      }
    });
  }

  handleExperienceCreated(newExperience: Experience): void {
    this.experienceService.addExperience(newExperience);
  }

  addExperienceMarker(experience: Experience): void {
    console.log('Adding experience', experience);
    const marker = L.marker([
      experience.position.lat,
      experience.position.lng,
    ]).addTo(this.map);

    // Attach a click event to open the ExperiencePopupComponent
    marker.on('click', () => {
      this.openExperiencePopup(marker, experience);
    });

    console.log('Added marker for experience:', experience.name);
    this.markers.push(marker);
  }

  clearMarkers(): void {
    this.markers.forEach((marker: L.Marker) => marker.remove());
    this.markers = [];
  }

  updateMarkers(): void {
    if (!this.map) {
      console.warn('Map is not initialized yet.');
      return;
    }

    // Clear existing markers before updating
    this.clearMarkers();

    // Define static markers based on selected date-time
    const markersData: Record<
      string,
      { title: string; position: [number, number] }
    > = {
      [this.formatDate(new Date())]: {
        title: 'Alte Oper Frankfurt',
        position: [50.1155, 8.6724],
      },
      [this.formatDate(new Date(Date.now() + 86400000))]: {
        title: 'Oper Frankfurt',
        position: [50.1097, 8.6638],
      },
    };

    const selectedDateStr = this.formatDate(this.selectedDateTime);
    const selectedMarker = markersData[selectedDateStr];
    if (selectedMarker) {
      const marker = L.marker(selectedMarker.position)
        .addTo(this.map)
        .bindPopup(selectedMarker.title)
        .openPopup();
      this.markers.push(marker);
      this.map.setView(selectedMarker.position);
      console.log('Added static marker:', selectedMarker.title);
    } else {
      console.log('No static events available for this date.');
    }

    // Add user-created experiences for the selected date-time
    this.experiences.forEach((exp: Experience) => {
      const selectedTimestamp = this.selectedDateTime.getTime();
      const expStart = new Date(exp.startDateTime).getTime();
      const expEnd = new Date(exp.endDateTime).getTime();

      // Check if the selected date-time falls within the experience's range
      if (selectedTimestamp >= expStart && selectedTimestamp <= expEnd) {
        this.addExperienceMarker(exp);
      }
    });
  }

  /**
   * Handles changes in the date-time picker
   * @param event The date-time change event
   */
  onDateTimeLocalChange(): void {
    if (this.selectedDateTimeLocal) {
      this.selectedDateTime = new Date(this.selectedDateTimeLocal);
      console.log('Selected date and time changed to:', this.selectedDateTime);
      this.updateMarkers();
    }
  }

  /**
   * Opens the ExperiencePopupComponent in a Leaflet popup
   * @param marker The Leaflet marker
   * @param experience The experience data
   */
  openExperiencePopup(marker: L.Marker, experience: Experience): void {
    // Create a div element for the popup content
    const popupDiv = document.createElement('div');

    // Create the component and attach it to the div
    const componentRef: ComponentRef<ExperiencePopupComponent> =
      this.componentFactoryResolver
        .resolveComponentFactory(ExperiencePopupComponent)
        .create(this.injector);
    componentRef.instance.experience = experience;

    // Attach the component to the Angular app
    this.appRef.attachView(componentRef.hostView);

    // Get the DOM element of the component
    const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;

    // Append the component's DOM to the popup div
    popupDiv.appendChild(domElem);

    // Bind the popup div to the marker
    marker.bindPopup(popupDiv).openPopup();

    // When the popup is closed, detach and destroy the component
    marker.on('popupclose', () => {
      this.appRef.detachView(componentRef.hostView);
      componentRef.destroy();
    });
  }
}
