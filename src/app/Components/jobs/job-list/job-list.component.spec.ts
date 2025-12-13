import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobListComponent } from './job-list.component';
import { HttpClient } from '@angular/common/http';
import { JobsService } from '../../../Services/job.service';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';

describe('JobListComponent', () => {
  let component: JobListComponent;
  let fixture: ComponentFixture<JobListComponent>;
  const jobsServiceMock = {
    getJobs: jasmine.createSpy('getJobs').and.returnValue(
      of({
        jobs: [
          { id: 1, title: 'Frontend Dev', company_name: 'Google' },
          { id: 2, title: 'Backend Dev', company_name: 'Amazon' },
        ],
      })
    ),
  };
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobListComponent],
      providers: [
        provideRouter([]),
        { provide: JobsService, useValue: jobsServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JobListComponent);
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
});
