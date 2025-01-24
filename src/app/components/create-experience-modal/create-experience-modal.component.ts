import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import * as L from 'leaflet';
import { Experience, ExperienceImage } from '../../models/experience.model';

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
    category: undefined,
    images: [],
  };

  startDate: string | null = null;
  startTime: string = '00:00';
  endDate: string | null = null;
  endTime: string = '00:00';
  hashtagsInput: string = '';

  constructor(
    public dialogRef: MatDialogRef<CreateExperienceModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Experience
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.initSelectMap();
  }

  ngOnDestroy(): void {
    if (this.selectMap) {
      this.selectMap.remove();
    }
  }
  initializeForm(): void {
    const now = new Date();
    if (this.isEditMode()) {
      this.populateFormFields(this.data!);
    } else {
      this.setDefaultDateTime(now);
    }
  }

  isEditMode(): boolean {
    return this.data && this.data.id != null;
  }

  /**
   * Populates form fields based on the provided experience data.
   * @param data The experience data to populate the form with.
   */
  populateFormFields(data: Experience): void {
    this.experience = { ...data };

    if (this.experience.startDateTime) {
      const start = new Date(this.experience.startDateTime);
      this.startDate = this.formatDate(start);
      this.startTime = this.formatTime(start);
    }
    if (this.experience.endDateTime) {
      const end = new Date(this.experience.endDateTime);
      this.endDate = this.formatDate(end);
      this.endTime = this.formatTime(end);
    }

    this.hashtagsInput = this.experience.hashtags?.join(' ') || '';
  }

  /**
   * Sets the default date and time to the current date and time.
   * @param date The date to set as default.
   */
  private setDefaultDateTime(date: Date): void {
    this.startDate = this.formatDate(date);
    this.startTime = this.formatTime(date);
  }

  /**
   * Formats a Date object to 'YYYY-MM-DD' string.
   * @param date The date to format.
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Formats a Date object to 'HH:MM' string.
   * @param date The date to format.
   */
  private formatTime(date: Date): string {
    return date.toTimeString().split(':').slice(0, 2).join(':');
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

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.experience.images?.push({
          preview: e.target?.result?.toString(), // Base64 preview
          file: file, // File object
        });
      };
      reader.readAsDataURL(file);
    });
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
          this.experience.address = firstResult.display_name;

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

    const filesToUpload = this.experience.images?.map((img) => img.file);
    this.dialogRef.close({
      experience: this.experience,
      files: filesToUpload,
    });

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
      category: undefined,
      images: [],
    };
    this.hashtagsInput = '';
  }
}
