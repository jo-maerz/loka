import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  createExperience(experience: Experience): Observable<Experience> {
    return this.http.post<Experience>(this.baseUrl, experience);
  }

  // Update an existing experience
  updateExperience(id: number, experience: Experience): Observable<Experience> {
    return this.http.put<Experience>(`${this.baseUrl}/${id}`, experience);
  }

  // Delete an experience
  deleteExperience(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
