import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateExperienceModalComponent } from './create-experience-modal.component';

describe('CreateExperienceModalComponent', () => {
  let component: CreateExperienceModalComponent;
  let fixture: ComponentFixture<CreateExperienceModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateExperienceModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateExperienceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
