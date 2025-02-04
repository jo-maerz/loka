import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import * as L from 'leaflet';
import { Experience, ExperienceImage } from '../../models/experience.model';
import { Subscription } from 'rxjs';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
} from 'rxjs/operators';
import { of } from 'rxjs';
import { GeocodeResult, MapService } from '../../services/map.service';

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

  experienceForm!: FormGroup;
  loading: boolean = false;

  // To store uploaded images
  uploadedImages: ExperienceImage[] = [];

  private subscriptions: Subscription = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<CreateExperienceModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Experience,
    private mapService: MapService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.initSelectMap();
    this.setupAddressAutoSearch();
  }

  ngOnDestroy(): void {
    if (this.selectMap) {
      this.selectMap.remove();
    }
    this.subscriptions.unsubscribe();
  }

  initializeForm(): void {
    this.experienceForm = this.fb.group({
      name: [this.data?.name || '', Validators.required],
      startDateTime: this.fb.group({
        date: [
          this.data?.startDateTime ? new Date(this.data.startDateTime) : null,
          Validators.required,
        ],
        time: [
          this.data?.startDateTime
            ? this.formatTime(new Date(this.data.startDateTime))
            : '00:00',
          Validators.required,
        ],
      }),
      endDateTime: this.fb.group({
        date: [
          this.data?.endDateTime ? new Date(this.data.endDateTime) : null,
          Validators.required,
        ],
        time: [
          this.data?.endDateTime
            ? this.formatTime(new Date(this.data.endDateTime))
            : '00:00',
          Validators.required,
        ],
      }),
      address: [this.data?.address || '', Validators.required],
      description: [this.data?.description || ''],
      hashtags: [this.data?.hashtags ? this.data.hashtags.join(' ') : ''],
      category: [this.data?.category || '', Validators.required],
      images: [this.data?.images || []],
      position: this.fb.group({
        lat: [this.data?.position?.lat || 0, Validators.required],
        lng: [this.data?.position?.lng || 0, Validators.required],
      }),
    });

    if (this.isEditMode() && this.data.position) {
      this.experienceForm.patchValue({
        address: this.data.address,
        position: {
          lat: this.data.position.lat,
          lng: this.data.position.lng,
        },
      });
    }
  }

  isEditMode(): boolean {
    return this.data && this.data.id != null;
  }

  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  initSelectMap(): void {
    const positionGroup = this.experienceForm.get('position') as FormGroup;
    const initialLat = positionGroup.get('lat')?.value || 50.1155;
    const initialLng = positionGroup.get('lng')?.value || 8.6724;

    this.selectMap = L.map('selectMap').setView([initialLat, initialLng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.selectMap);

    if (
      this.isEditMode() &&
      this.data.position &&
      this.data.position.lat &&
      this.data.position.lng
    ) {
      this.addMarker(this.data.position.lat, this.data.position.lng);
    }

    this.selectMap.on('click', this.onSelectMapClick.bind(this));
  }

  /**
   * Sets up automatic address search when user stops typing for 1 second.
   */
  setupAddressAutoSearch(): void {
    const addressControl = this.experienceForm.get('address') as FormControl;

    const addressSub = addressControl.valueChanges
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        switchMap((address: string) => {
          if (address && address.trim().length > 0) {
            this.loading = true;
            return this.mapService.geocodeAddress(address.trim()).pipe(
              catchError((error) => {
                this.loading = false;
                alert(error.message);
                return of([]);
              })
            );
          } else {
            this.loading = false;
            return of([]);
          }
        })
      )
      .subscribe({
        next: (results: GeocodeResult[]) => {
          this.loading = false;
          if (results && results.length > 0) {
            const firstResult = results[0];
            const lat = parseFloat(firstResult.lat);
            const lng = parseFloat(firstResult.lon);
            this.updatePosition(lat, lng, firstResult.display_name);
          } else if (addressControl.value.trim().length > 0) {
            alert('Address not found.');
          }
        },
        error: (error: Error) => {
          this.loading = false;
          alert(error.message);
        },
      });

    this.subscriptions.add(addressSub);
  }

  /**
   * Handles map click events to add a marker and perform reverse geocoding.
   * Also updates the address input without triggering the auto-search.
   */
  onSelectMapClick(event: L.LeafletMouseEvent): void {
    const { lat, lng } = event.latlng;
    this.addMarker(lat, lng);

    const reverseGeocodeSub = this.mapService
      .reverseGeocode(lat, lng)
      .subscribe({
        next: (address: string) => {
          this.experienceForm
            .get('address')
            ?.setValue(address, { emitEvent: false });
          this.updatePosition(lat, lng, address);
        },
        error: (error: Error) => {
          alert(error.message);
        },
      });

    this.subscriptions.add(reverseGeocodeSub);
  }

  addMarker(lat: number, lng: number): void {
    if (this.selectMarker) {
      this.selectMap.removeLayer(this.selectMarker);
      this.selectMarker = null;
    }
    this.selectMarker = L.marker([lat, lng]).addTo(this.selectMap);
  }

  updatePosition(lat: number, lng: number, address: string): void {
    // Update the position in the form
    const positionGroup = this.experienceForm.get('position') as FormGroup;
    positionGroup.patchValue({
      lat: lat,
      lng: lng,
    });

    this.experienceForm.patchValue({
      address: address,
    });

    if (this.selectMarker) {
      this.selectMap.removeLayer(this.selectMarker);
    }
    this.selectMarker = L.marker([lat, lng]).addTo(this.selectMap);

    this.selectMap.setView([lat, lng], 14);
  }

  handleFileUpload(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (!files) return;

    const currentImages = this.experienceForm.get('images')?.value || [];

    if (currentImages.length + files.length > 10) {
      alert('You can upload up to 10 images.');
      return;
    }

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        currentImages.push({
          preview: e.target?.result?.toString(),
          file: file,
        });
        this.experienceForm.get('images')?.setValue(currentImages);
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Combines date and time into ISO string
   */
  getCombinedDateTime(groupName: 'startDateTime' | 'endDateTime'): string {
    const group = this.experienceForm.get(groupName) as FormGroup;
    const date: Date = group.get('date')?.value;
    const time: string = group.get('time')?.value;

    if (!date || !time) return '';

    const [hours, minutes] = time.split(':').map(Number);
    const combinedDate = new Date(date);
    combinedDate.setHours(hours, minutes, 0, 0);
    return combinedDate.toISOString();
  }

  submitExperience(): void {
    if (this.experienceForm.invalid) {
      this.experienceForm.markAllAsTouched();
      alert('Please fill in all required fields correctly.');
      return;
    }

    const startDateTime = this.getCombinedDateTime('startDateTime');
    const endDateTime = this.getCombinedDateTime('endDateTime');

    if (new Date(endDateTime) <= new Date(startDateTime)) {
      alert('End date and time must be after start date and time.');
      return;
    }

    const hashtagsInput = this.experienceForm.get('hashtags')?.value || '';
    const hashtags = hashtagsInput
      .split(' ')
      .filter((tag: string) => tag.startsWith('#') && tag.length > 1);

    const positionGroup = this.experienceForm.get('position') as FormGroup;
    const position = {
      lat: positionGroup.get('lat')?.value,
      lng: positionGroup.get('lng')?.value,
    };

    const experience: Experience = {
      id: this.data?.id,
      name: this.experienceForm.get('name')?.value,
      startDateTime: startDateTime,
      endDateTime: endDateTime,
      address: this.experienceForm.get('address')?.value,
      position: position,
      description: this.experienceForm.get('description')?.value,
      hashtags: hashtags,
      category: this.experienceForm.get('category')?.value,
    };

    const filesToUpload = this.experienceForm
      .get('images')
      ?.value?.map((img: ExperienceImage) => img.file);

    this.dialogRef.close({
      experience: experience,
      files: filesToUpload,
    });

    this.resetForm();
  }

  resetForm(): void {
    this.experienceForm.reset({
      name: '',
      startDateTime: {
        date: null,
        time: '00:00',
      },
      endDateTime: {
        date: null,
        time: '00:00',
      },
      address: '',
      description: '',
      hashtags: '',
      category: '',
      images: [],
      position: {
        lat: 0,
        lng: 0,
      },
    });
    this.uploadedImages = [];
    if (this.selectMarker) {
      this.selectMap.removeLayer(this.selectMarker);
      this.selectMarker = null;
    }
    // Reset the map view to default
    this.selectMap.setView([50.1155, 8.6724], 14);
  }
}
