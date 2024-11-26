// src/app/services/experience.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Experience } from '../models/experience.model';

@Injectable({
  providedIn: 'root',
})
export class ExperienceService {
  private experiencesSubject: BehaviorSubject<Experience[]> =
    new BehaviorSubject<Experience[]>([]);
  public experiences$: Observable<Experience[]> =
    this.experiencesSubject.asObservable();

  constructor() {}

  /**
   * Retrieves the current list of experiences.
   */
  getExperiences(): Observable<Experience[]> {
    return this.experiences$;
  }

  /**
   * Adds a new experience to the list.
   * @param experience The experience to add.
   */
  addExperience(experience: Experience): void {
    const currentExperiences = this.experiencesSubject.getValue();
    this.experiencesSubject.next([...currentExperiences, experience]);
  }

  /**
   * Optionally, implement methods to remove or update experiences.
   */
}
