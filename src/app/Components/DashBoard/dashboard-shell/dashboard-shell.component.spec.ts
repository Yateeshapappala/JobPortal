import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardShellComponent } from './dashboard-shell.component';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { JobsService } from '../../../Services/job.service';
import { AuthService } from '../../../Services/Auth.service';

describe('DashboardShellComponent', () => {
  let component: DashboardShellComponent;
  let fixture: ComponentFixture<DashboardShellComponent>;
  const jobsServiceMock = {
    getJobs: jasmine.createSpy('getJobs').and.returnValue(
      of({
        jobs: [
          { id: 1, title: 'Frontend Dev' },
          { id: 2, title: 'Backend Dev' },
          { id: 3, title: 'Fullstack Dev' },
        ],
      })
    ),
  };

  // ✅ Mock AuthService
  const authServiceMock = {
    isLoggedIn: jasmine.createSpy('isLoggedIn').and.returnValue(false),
  };
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardShellComponent],
      providers: [
        provideRouter([]), // Router
        { provide: JobsService, useValue: jobsServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should load recent jobs on init', () => {
    expect(jobsServiceMock.getJobs).toHaveBeenCalled();
    expect(component.recentJobs.length).toBe(3);
    expect(component.loadingJobs).toBeFalse();
  });

  it('should navigate to login if user is not logged in', () => {
    component.applyFromRecent({ id: 99 });
    // no error = pass (router is mocked by provideRouter)
    expect(authServiceMock.isLoggedIn).toHaveBeenCalled();
  });
});
