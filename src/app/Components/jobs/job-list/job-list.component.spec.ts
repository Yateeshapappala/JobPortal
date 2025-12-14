import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { JobListComponent } from './job-list.component';
import { JobsService } from '../../../Services/job.service';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// --- Mock Data ---
const mockJobs = [
  { id: 1, title: 'Frontend Developer', company_name: 'TechCorp', location: 'Remote' },
  { id: 2, title: 'Backend Engineer', company_name: 'DevSolutions', location: 'On-site' },
  { id: 3, title: 'Full Stack Developer', company_name: 'TechCorp', location: 'Hybrid' },
  { id: 4, title: 'Data Scientist', company_name: 'DataLabs', location: 'Remote' },
  { id: 5, title: 'UI/UX Designer', company_name: 'DesignHub', location: 'Remote' },
];

// --- Mock Service ---
class MockJobsService {
  getJobs = jasmine.createSpy('getJobs').and.returnValue(
    of({ jobs: mockJobs })
  );
}

describe('JobListComponent', () => {
  let component: JobListComponent;
  let fixture: ComponentFixture<JobListComponent>;
  let jobsService: JobsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterModule.forRoot([]),
        FormsModule,
        JobListComponent
      ],
      providers: [
        { provide: JobsService, useClass: MockJobsService }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(JobListComponent);
    component = fixture.componentInstance;
    jobsService = TestBed.inject(JobsService);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should fetch jobs and populate jobs and filteredJobs arrays', fakeAsync(() => {
      fixture.detectChanges();
      tick(); 

      expect(jobsService.getJobs).toHaveBeenCalledTimes(1);
      expect(component.jobs.length).toBe(mockJobs.length);
      expect(component.filteredJobs.length).toBe(mockJobs.length);
    }));
  });

  describe('Job Filtering (Search)', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should filter jobs by title search text', () => {
      component.searchText = 'Frontend';
      component.filterJobs();
      expect(component.filteredJobs.length).toBe(1);
      expect(component.filteredJobs[0].title).toBe('Frontend Developer');
    });

    it('should filter jobs by company name search text (case insensitive)', () => {
      component.searchText = 'techcorp';
      component.filterJobs();
      expect(component.filteredJobs.length).toBe(2);
    });
  });

  describe('Bookmarks', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should add a job to bookmarkedJobs when toggleBookmark is called', () => {
      component.bookmarkedJobs = [];
      component.toggleBookmark(2);
      expect(component.bookmarkedJobs).toEqual([2]);
    });

    it('should filter jobs to show only bookmarked items when toggleBookmarkFilter is active', () => {
      component.bookmarkedJobs = [1, 3];
      component.showBookmarksOnly = false;
      
      component.toggleBookmarkFilter();
      expect(component.showBookmarksOnly).toBeTrue();
      expect(component.filteredJobs.length).toBe(2);
    });
  });

  describe('Pagination', () => {
    beforeEach(fakeAsync(() => {
      component.pageSize = 2;
      fixture.detectChanges();
      tick();
    }));

    it('should calculate the correct number of total pages', () => {
      expect(component.totalPages).toBe(3);
    });

    it('should calculate the correct paginatedJobs for the first page', () => {
      component.page = 1;
      expect(component.paginatedJobs.length).toBe(2);
    });

    it('should move to the next page', () => {
      component.page = 1;
      component.nextPage();
      expect(component.page).toBe(2);
    });
  });
});