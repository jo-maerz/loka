import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperienceSidebarComponent } from './experience-sidebar.component';

describe('ExperienceSidebarComponent', () => {
  let component: ExperienceSidebarComponent;
  let fixture: ComponentFixture<ExperienceSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExperienceSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExperienceSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
