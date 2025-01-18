import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperiencePopupComponent } from './experience-popup.component';

describe('ExperiencePopupComponent', () => {
  let component: ExperiencePopupComponent;
  let fixture: ComponentFixture<ExperiencePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExperiencePopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExperiencePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
