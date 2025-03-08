import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Experience } from '../models/experience.model';

@Injectable({
  providedIn: 'root',
})
export class ExperienceService {
  private baseUrl = 'http://localhost:8080/api/experiences';

  constructor(private http: HttpClient) {}

  getFilteredExperiences(
    city?: string,
    startDate?: Date,
    endDate?: Date,
    category?: string | null
  ): Observable<Experience[]> {
    let params = new HttpParams();

    if (city) {
      params = params.set('city', city);
    }
    if (startDate) {
      // Convert JS date to ISO string: "2025-01-21T10:00:00"
      params = params.set('startDateTime', startDate.toISOString());
    }
    if (endDate) {
      params = params.set('endDateTime', endDate.toISOString());
    }
    if (category) {
      params = params.set('category', category);
    }

    return this.http.get<Experience[]>(`${this.baseUrl}/search`, { params });
  }

  getAllExperiences(): Observable<Experience[]> {
    return this.http.get<Experience[]>(this.baseUrl);
  }

  getExperienceById(id: number): Observable<Experience> {
    return this.http.get<Experience>(`${this.baseUrl}/${id}`);
  }

  createExperience(
    experience: Experience,
    files: File[]
  ): Observable<Experience> {
    const formData = new FormData();
    if (!experience) {
      throw new Error('Experience object is undefined');
    }
    const experienceBlob = new Blob(
      [
        JSON.stringify({
          ...experience,
          startDateTime: experience.startDateTime.toISOString(),
          endDateTime: experience.endDateTime.toISOString(),
        }),
      ],
      {
        type: 'application/json',
      }
    );
    formData.append('experience', experienceBlob);

    files.forEach((file) => {
      formData.append('images', file, file.name);
    });

    return this.http.post<Experience>(this.baseUrl, formData);
  }

  updateExperience(
    id: number,
    experience: Experience,
    files: File[]
  ): Observable<Experience> {
    const formData = new FormData();
    if (!experience) {
      throw new Error('Experience object is undefined');
    }
    const experienceBlob = new Blob([JSON.stringify(experience)], {
      type: 'application/json',
    });
    formData.append('experience', experienceBlob);

    files.forEach((file) => {
      formData.append('images', file, file.name);
    });

    return this.http.put<Experience>(`${this.baseUrl}/${id}`, formData, {
      headers: new HttpHeaders({
        Accept: 'application/json',
      }),
    });
  }

  deleteExperience(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
