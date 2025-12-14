import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';

// External Libraries
import { ToastrService } from 'ngx-toastr';

// Component and Services to test
import { JobDetailsComponent } from './job-details.component';
import { JobsService } from '../../../Services/job.service';

// --- Mock ApplyModalComponent (To satisfy the component template import) ---
@Component({
  selector: 'app-apply-modal',
  template: '', // Empty template, we only test interaction (events/inputs)
  standalone: true,
})
class MockApplyModalComponent {
  @Input() jobId: string | number | undefined;
  @Input() jobTitle: string = '';
  @Input() jobCompany?: string;
  @Output() onModalHidden = new EventEmitter<void>();
}

// --- Mock Data ---
const mockJob = {
  id: 42,
  title: 'Senior Angular Developer',
  company_name: 'CodeMasters',
  description: 'Build amazing things with Angular.',
  location: 'Remote',
  salary: '$150k',
  candidate_required_location: 'Anywhere',
  job_type: 'Full-time',
  tags: ['Angular', 'TypeScript', 'RxJS'],
  publication_date: new Date().toISOString(),
};

// --- Mock Dependencies ---

class MockJobsService {
  // Spy for API call
  getJobById = jasmine.createSpy('getJobById').and.returnValue(of(mockJob));
}

const mockActivatedRoute = {
  // Simulate route parameter /jobs/42
  snapshot: {
    params: { id: '42' }
  }
};

class MockLocation {
  // Spy for goBack navigation
  back = jasmine.createSpy('back');
}

class MockToastrService {
  // Spies for toastr messages
  success = jasmine.createSpy('success');
  error = jasmine.createSpy('error');
}

/**
 * NOTE: The original component likely injects an AuthService which reads
 * localStorage in its constructor. We provide a clean mock here just in case,
 * but the core fix is in selectively mocking localStorage.getItem later.
 */
class MockAuthService {
  // A minimal mock to prevent the real service from crashing during injection.
}

describe('JobDetailsComponent', () => {
  let component: JobDetailsComponent;
  let fixture: ComponentFixture<JobDetailsComponent>;
  let jobService: JobsService;
  let location: Location;
  let toastrService: MockToastrService;

  const appliedJobsKey = 'appliedJobIds';
  // Spy reference for controlling localStorage access
  let localStorageGetSpy: jasmine.Spy;

  beforeEach(async () => {
        localStorage.clear();
       
        // Spy on getItem before TestBed setup. Default behavior is callThrough.
        localStorageGetSpy = spyOn(localStorage, 'getItem').and.callThrough();

        await TestBed.configureTestingModule({
            imports: [JobDetailsComponent, MockApplyModalComponent],
            providers: [
                { provide: JobsService, useClass: MockJobsService },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: Location, useClass: MockLocation },
                { provide: ToastrService, useClass: MockToastrService },
                // { provide: AuthService, useClass: MockAuthService },
            ]
        }).compileComponents();
   
        fixture = TestBed.createComponent(JobDetailsComponent);
        component = fixture.componentInstance;
        jobService = TestBed.inject(JobsService);
        location = TestBed.inject(Location);
        toastrService = TestBed.inject(ToastrService) as unknown as MockToastrService;
  });

    afterEach(() => {
        // Restore spy after each test to ensure other tests aren't affected
        localStorageGetSpy.and.callThrough();
    });

  // ---------------------- CORE INITIALIZATION TESTS ----------------------

  it('should create and initialize component with job details', fakeAsync(() => {
    fixture.detectChanges(); // Triggers ngOnInit
    tick(); // Resolves Observable

    expect(jobService.getJobById).toHaveBeenCalledWith('42');
    expect(component.jobId).toBe('42');
    expect(component.jobDetails).toEqual(mockJob);
    expect(component.isJobApplied).toBeFalse();
  }));

  // Test API error handling path (for coverage on `catchError` and `toastr.error`)
  it('should handle API error gracefully (jobDetails should be undefined and toastr called)', fakeAsync(() => {
    // Arrange: Mock the service to throw an error
    (jobService.getJobById as jasmine.Spy).and.returnValue(throwError(() => new Error('API Error')));
   
    fixture.detectChanges();
    tick();

    expect(component.jobDetails).toBeUndefined();
    expect(toastrService.error).toHaveBeenCalledWith('Could not load job details.', 'Error');
  }));

  // ---------------------- APPLICATION STATUS & LOCAL STORAGE TESTS ----------------------

  describe('Application Status & Local Storage', () => {

    it('should set isJobApplied to TRUE if job ID is found in local storage', fakeAsync(() => {
      // Arrange: Set up storage with the ID 42 (number)
      localStorage.setItem(appliedJobsKey, JSON.stringify([10, 42, 99]));

      fixture.detectChanges();
      tick();

      expect(component.isJobApplied).toBeTrue();
    }));

    it('should set isJobApplied to FALSE if job ID is NOT found in local storage', fakeAsync(() => {
      // Arrange: Set up storage without the ID 42
      localStorage.setItem(appliedJobsKey, JSON.stringify([10, 99]));

      fixture.detectChanges();
      tick();

      expect(component.isJobApplied).toBeFalse();
    }));
   
    it('should set isJobApplied to FALSE if local storage is empty', fakeAsync(() => {
        // Arrange: localStorage is clear from beforeEach
        fixture.detectChanges();
        tick();
        expect(component.isJobApplied).toBeFalse();
    }));
   
    // CRITICAL FIX TEST: Tests the 'catch' block in checkAppliedStatus (100% branch coverage)
    it('should handle JSON parse error in checkAppliedStatus and set isJobApplied to FALSE', fakeAsync(() => {
       
        // Arrange: Use callFake to simulate the error ONLY for the appliedJobsKey.
        // This prevents a potential crash in any injected services (like AuthService)
        // that might also read localStorage during setup.
        localStorageGetSpy.and.callFake((key: string) => {
            if (key === appliedJobsKey) {
                return '{ "id": 42, "status": '; // Invalid JSON
            }
            // Return null for all other keys (e.g., AuthService key)
            return null;
        });
       
        // Act: Re-initialize the component to trigger ngOnInit and checkAppliedStatus
        component.ngOnInit();
        fixture.detectChanges();
        tick();

        // Assert: The component's catch block executes, resetting the status.
        expect(component.isJobApplied).toBeFalse();
    }));


    it('should update isJobApplied status when onModalHidden is called', fakeAsync(() => {
      fixture.detectChanges();
      tick();
     
      expect(component.isJobApplied).toBeFalse();
     
      // Simulate application save (update localStorage)
      localStorage.setItem(appliedJobsKey, JSON.stringify([42]));
     
      // Act: Call the method that re-reads storage
      component.onModalHidden();
     
      expect(component.isJobApplied).toBeTrue();
    }));
  });

  // ---------------------- NAVIGATION TESTS ----------------------

  describe('Navigation Actions', () => {
    it('should call location.back() when goBack is called', () => {
      component.goBack();
      expect(location.back).toHaveBeenCalledTimes(1);
    });
  });
});