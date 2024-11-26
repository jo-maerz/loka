import { Component, Input, OnInit } from '@angular/core';
import { Experience } from '../../models/experience.model';

@Component({
  selector: 'app-experience-popup',
  templateUrl: './experience-popup.component.html',
  styleUrls: ['./experience-popup.component.scss'],
})
export class ExperiencePopupComponent implements OnInit {
  @Input() experience!: Experience;

  constructor() {}

  ngOnInit(): void {}

  /**
   * Formats the start and end date-times for display
   */
  get formattedDateRange(): string {
    const start = new Date(this.experience.startDateTime);
    const end = new Date(this.experience.endDateTime);
    return `${start.toLocaleString()} - ${end.toLocaleString()}`;
  }
}
