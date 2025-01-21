import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import * as L from 'leaflet';
import { Experience } from '../../models/experience.model';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/marker-icon-2x.png',
  iconUrl: 'assets/marker-icon.png',
  shadowUrl: 'assets/marker-shadow.png',
});

@Component({
  selector: 'app-create-experience-modal',
  templateUrl: './create-experience-modal.component.html',
  styleUrls: ['./create-experience-modal.component.scss'],
})
export class CreateExperienceModalComponent implements OnInit, OnDestroy {
  selectMap!: L.Map;
  selectMarker: L.Marker | null = null;

  experience: Experience = {
    id: undefined,
    name: '',
    startDateTime: '',
    endDateTime: '',
    address: '',
    position: { lat: 0, lng: 0 },
    description: '',
    hashtags: [],
    category: '',
    pictures: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  startDate: string | null = null;
  startTime: string = '00:00';
  endDate: string | null = null;
  endTime: string = '00:00';
  hashtagsInput: string = '';

  constructor(
    public dialogRef: MatDialogRef<CreateExperienceModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Experience
  ) {
    if (data) {
      // Populate experience fields for editing
      this.experience = { ...this.data };

      // Parse start / end date-times
      if (this.experience.startDateTime) {
        const start = new Date(this.experience.startDateTime);
        this.startDate = start.toISOString().split('T')[0];
        this.startTime = start.toTimeString().split(':').slice(0, 2).join(':');
      }

      if (this.experience.endDateTime) {
        const end = new Date(this.experience.endDateTime);
        this.endDate = end.toISOString().split('T')[0];
        this.endTime = end.toTimeString().split(':').slice(0, 2).join(':');
      }

      // Populate hashtags
      this.hashtagsInput = this.experience.hashtags?.join(' ') || '';
    }
  }

  ngOnInit(): void {
    this.initSelectMap();
  }

  ngOnDestroy(): void {
    if (this.selectMap) {
      this.selectMap.remove();
    }
  }

  initSelectMap(): void {
    this.selectMap = L.map('selectMap').setView([50.1155, 8.6724], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.selectMap);

    if (
      this.data?.position?.lat !== undefined &&
      this.data?.position?.lng !== undefined
    ) {
      this.selectMap.setView(
        [this.data.position.lat, this.data.position.lng],
        14
      );
      this.addMarker(this.data.position.lat, this.data.position.lng);
    }

    this.selectMap.on('click', this.onSelectMapClick.bind(this));
  }

  onSelectMapClick(event: L.LeafletMouseEvent): void {
    const { lat, lng } = event.latlng;
    console.log('Selected location on selectMap:', lat, lng);
    this.addMarker(lat, lng);
  }

  addMarker(lat: number, lng: number): void {
    if (this.selectMarker) {
      this.selectMap.removeLayer(this.selectMarker);
      this.selectMarker = null;
    }
    this.selectMarker = L.marker([lat, lng]).addTo(this.selectMap);
    this.experience.position = { lat, lng };
  }

  handleFileUpload(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target && typeof e.target.result === 'string') {
          if (
            this.experience.pictures &&
            this.experience.pictures.length < 10
          ) {
            this.experience.pictures.push(e.target.result);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  }

  geocodeAddress(): void {
    if (!this.experience.address) return;
    const query = encodeURIComponent(this.experience.address);
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.length > 0) {
          const firstResult = data[0];
          const lat = parseFloat(firstResult.lat);
          const lng = parseFloat(firstResult.lon);
          this.experience.position = { lat, lng };

          this.selectMap.setView([lat, lng], 14);
          if (this.selectMarker) {
            this.selectMap.removeLayer(this.selectMarker);
          }
          this.selectMarker = L.marker([lat, lng]).addTo(this.selectMap);
        } else {
          alert('Address not found.');
        }
      })
      .catch((error) => {
        console.error('Error during geocoding:', error);
        alert('Failed to geocode the address.');
      });
  }

  getCombinedStartDateTime(): string {
    if (!this.startDate) return '';
    const [hours, minutes] = this.startTime.split(':').map(Number);
    const combinedDate = new Date(this.startDate);
    combinedDate.setHours(hours, minutes, 0, 0);
    return combinedDate.toISOString();
  }

  getCombinedEndDateTime(): string {
    if (!this.endDate) return '';
    const [hours, minutes] = this.endTime.split(':').map(Number);
    const combinedDate = new Date(this.endDate);
    combinedDate.setHours(hours, minutes, 0, 0);
    return combinedDate.toISOString();
  }

  submitExperience(): void {
    // Validate required fields
    if (
      !this.experience.name ||
      !this.startDate ||
      !this.endDate ||
      !this.experience.position?.lat ||
      !this.experience.position?.lng
    ) {
      alert('Please fill in all required fields (Name, Date Range, Location).');
      return;
    }

    // Ensure that end date-time is after start date-time
    const startDateTime = this.getCombinedStartDateTime();
    const endDateTime = this.getCombinedEndDateTime();
    if (new Date(endDateTime) <= new Date(startDateTime)) {
      alert('End date and time must be after start date and time.');
      return;
    }

    this.experience.startDateTime = startDateTime;
    this.experience.endDateTime = endDateTime;

    this.experience.hashtags = this.hashtagsInput
      .split(' ')
      .filter((tag) => tag.startsWith('#') && tag.length > 1);

    // Update timestamps
    const now = new Date().toISOString();
    this.experience.createdAt = now;
    this.experience.updatedAt = now;

    this.dialogRef.close({ ...this.experience });

    this.resetForm();
  }

  resetForm(): void {
    this.startDate = null;
    this.startTime = '00:00';
    this.endDate = null;
    this.endTime = '00:00';
    this.experience = {
      id: undefined,
      name: '',
      description: '',
      address: '',
      position: { lat: 0, lng: 0 },
      startDateTime: '',
      endDateTime: '',
      hashtags: [],
      category: '',
      pictures: [],
      createdAt: '',
      updatedAt: '',
    };
    this.hashtagsInput = '';
  }
}
