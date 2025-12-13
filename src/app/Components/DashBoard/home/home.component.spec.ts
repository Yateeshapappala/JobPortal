import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { provideRouter } from '@angular/router';
import { JobsService } from '../../../Services/job.service';
import { AuthService } from '../../../Services/auth.service';
import { of } from 'rxjs';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  const jobsServiceMock = {
    getJobs: jasmine.createSpy('getJobs').and.returnValue(
      of({
        jobs: [
          { id: 1, title: 'Frontend Developer', company_name: 'Test Co' },
          { id: 2, title: 'Backend Developer', company_name: 'Demo Inc' },
        ],
      })
    ),
  };
  const authServiceMock = {
    isLoggedIn: jasmine.createSpy('isLoggedIn').and.returnValue(false),
  };
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        { provide: JobsService, useValue: jobsServiceMock },
        { provide: AuthService, usevalue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
   it('should load jobs on init', () => {
    expect(jobsServiceMock.getJobs).toHaveBeenCalled();
    expect(component.jobs.length).toBe(2);
    expect(component.filteredJobs.length).toBe(2);
  });

  it('should filter jobs when search is applied', () => {
    component.applyFilter('frontend');
    expect(component.filteredJobs.length).toBe(1);
    expect(component.filteredJobs[0].title).toContain('Frontend');
  });
});
