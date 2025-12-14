import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { JobDetailsComponent } from './job-details.component';
import { ActivatedRoute } from '@angular/router';
import { JobsService } from '../../../Services/job.service';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';
import { ApplyModalComponent } from '../apply-modal/apply-modal.component';
import { Component, Input, Output, EventEmitter } from '@angular/core';

// --- Mock ApplyModalComponent (FIX for NullInjectorError) ---
// This mock prevents the testing bed from trying to resolve ToastrService dependencies
// required by the real ApplyModalComponent.
@Component({
  selector: 'app-apply-modal',
  template: '', // Empty template
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
};

// --- Mock Dependencies ---
class MockJobsService {
  getJobById = jasmine.createSpy('getJobById').and.returnValue(of(mockJob));
}

const mockActivatedRoute = {
  snapshot: {
    params: { id: '42' }
  }
};

class MockLocation {
  back = jasmine.createSpy('back');
}

describe('JobDetailsComponent', () => {
  let component: JobDetailsComponent;
  let fixture: ComponentFixture<JobDetailsComponent>;
  let jobService: JobsService;
  let location: Location;

  // Key for local storage tracking
  const appliedJobsKey = 'appliedJobIds';

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      // IMPORTANT: Use the MockApplyModalComponent instead of the real one
      imports: [JobDetailsComponent, MockApplyModalComponent], 
      providers: [
        { provide: JobsService, useClass: MockJobsService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Location, useClass: MockLocation }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(JobDetailsComponent);
    component = fixture.componentInstance;
    jobService = TestBed.inject(JobsService);
    location = TestBed.inject(Location);
  });

  it('should create and initialize component with job details', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    expect(jobService.getJobById).toHaveBeenCalledWith('42');
    expect(component.jobId).toBe('42');
    expect(component.jobDetails).toEqual(mockJob);
    expect(component.isJobApplied).toBeFalse();
  }));

  it('should handle API error gracefully (jobDetails should be null/undefined)', fakeAsync(() => {
    (jobService.getJobById as jasmine.Spy).and.returnValue(throwError(() => new Error('API Error')));
    
    fixture.detectChanges();
    tick();

    expect(component.jobDetails).toBeUndefined(); 
  }));

  describe('Application Status & Local Storage', () => {
    it('should set isJobApplied to TRUE if job ID is found in local storage', fakeAsync(() => {
      localStorage.setItem(appliedJobsKey, JSON.stringify([10, 42, 99])); 

      fixture.detectChanges();
      tick(); 

      expect(component.isJobApplied).toBeTrue();
    }));

    it('should set isJobApplied to FALSE if job ID is NOT found in local storage', fakeAsync(() => {
      localStorage.setItem(appliedJobsKey, JSON.stringify([10, 99])); 

      fixture.detectChanges();
      tick(); 

      expect(component.isJobApplied).toBeFalse();
    }));

    it('should update isJobApplied status when onModalHidden is called', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      expect(component.isJobApplied).toBeFalse();
      
      localStorage.setItem(appliedJobsKey, JSON.stringify([42])); 
      
      component.onModalHidden(); 
      
      expect(component.isJobApplied).toBeTrue();
    }));
  });

  describe('Modal and Navigation Actions', () => {
    it('should open the apply modal when openApplyModal is called', () => {
      expect(component.showApply).toBeFalse();
      component.openApplyModal();
      expect(component.showApply).toBeTrue();
    });

    it('should call location.back() when goBack is called', () => {
      component.goBack();
      expect(location.back).toHaveBeenCalledTimes(1);
    });
  });
});