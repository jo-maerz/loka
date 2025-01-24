import { Injectable } from '@angular/core';
import { Experience } from '../models/experience.model';

@Injectable({ providedIn: 'root' })
export class ImageConverterService {
  convertImages(experience: Experience): Experience {
    if (experience.images) {
      return {
        ...experience,
        images: experience.images.map((img) => ({
          ...img,
          preview: img.data ? this.arrayBufferToBase64(img.data) : img.preview,
        })),
      };
    }
    return experience;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    return btoa(String.fromCharCode(...bytes));
  }
}
