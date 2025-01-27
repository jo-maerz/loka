import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Experience } from '../models/experience.model';

@Injectable({
  providedIn: 'root',
})
export class ExperienceService {
  private baseUrl = 'http://localhost:8080/api/experiences';

  constructor(private http: HttpClient) {}

  // Get all experiences
  getAllExperiences(): Observable<Experience[]> {
    return this.http.get<Experience[]>(this.baseUrl);
  }

  // Get a single experience by ID
  getExperienceById(id: number): Observable<Experience> {
    return this.http.get<Experience>(`${this.baseUrl}/${id}`);
  }

  // Create a new experience
  createExperience(
    experience: Experience,
    files: File[]
  ): Observable<Experience> {
    const formData = new FormData();
    if (!experience) {
      throw new Error('Experience object is undefined');
    }

    formData.append('experience', JSON.stringify(experience));

    files.forEach((file) => {
      formData.append('images', file, file.name);
    });

    return this.http.post<Experience>(this.baseUrl, formData);
  }

  // Update an existing experience
  updateExperience(
    id: number,
    experience: Experience,
    files: File[]
  ): Observable<Experience> {
    const formData = new FormData();
    if (!experience) {
      throw new Error('Experience object is undefined');
    }

    formData.append('experience', JSON.stringify(experience));

    files.forEach((file) => {
      formData.append('images', file, file.name);
    });

    return this.http.put<Experience>(`${this.baseUrl}/${id}`, formData, {
      headers: new HttpHeaders({
        Accept: 'application/json',
      }),
    });
  }

  // Delete an experience
  deleteExperience(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
