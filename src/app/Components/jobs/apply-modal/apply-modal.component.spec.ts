import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApplicationStorageService } from '../../../Services/application-storage.service';
import { AuthService } from '../../../Services/auth.service';
import { ApplyModalComponent, contactNumberValidator } from './apply-modal.component';
import { CommonModule } from '@angular/common';

// --- Mock Dependencies ---

class MockToastrService {
  success = jasmine.createSpy('success');
  error = jasmine.createSpy('error');
}

class MockApplicationStorageService {
  saveApplication = jasmine.createSpy('saveApplication').and.returnValue(true);
}

class MockAuthService {
  // Mock a user with an email for the submission logic
  getUser = jasmine.createSpy('getUser').and.returnValue({ email: 'test@user.com' });
}

describe('ApplyModalComponent', () => {
  let component: ApplyModalComponent;
  let fixture: ComponentFixture<ApplyModalComponent>;
  let toastrService: MockToastrService;
  let appStorageService: MockApplicationStorageService;
  let authService: MockAuthService;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [ApplyModalComponent, CommonModule, ReactiveFormsModule],
      providers: [
        FormBuilder,
        // The real ToastrService requires dependencies (ToastConfig), so we use the mock
        { provide: ToastrService, useClass: MockToastrService },
        { provide: ApplicationStorageService, useClass: MockApplicationStorageService },
        { provide: AuthService, useClass: MockAuthService },
      ],
    }).compileComponents();
    
    fixture = TestBed.createComponent(ApplyModalComponent);
    component = fixture.componentInstance;
    toastrService = TestBed.inject(ToastrService) as unknown as MockToastrService;
    appStorageService = TestBed.inject(ApplicationStorageService) as unknown as MockApplicationStorageService;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;

    component.ngOnInit();
  });

  it('should create the component and initialize the form', () => {
    expect(component).toBeTruthy();
    // FIX 1: Updated expected count to 16
    expect(Object.keys(component.applyForm.controls).length).toBe(16); 
    expect(component.f['fullName'].hasValidator(Validators.required)).toBeTrue();
  });

  describe('Custom Contact Number Validator', () => {
    const validator = contactNumberValidator;

    it('should be valid for a 10-digit unique number', () => {
      expect(validator({ value: '1234567890' } as any)).toBeNull();
    });

    it('should be invalid for all same digits (000...0)', () => {
      expect(validator({ value: '0000000000' } as any)).toEqual({ allSameDigits: true });
    });
  });

  describe('Conditional Validation (Experience)', () => {
    const experienceFields = ['previousCompany', 'previousRole', 'experienceYears'];

    it('should REQUIRE experience details for "Experienced"', () => {
      component.f['experience'].setValue('Experienced');
      component.onExperienceChange({ target: { value: 'Experienced' } });
      
      experienceFields.forEach(field => {
        expect(component.f[field].hasValidator(Validators.required)).toBeTrue();
      });
    });
  });

  describe('Form Submission', () => {
    const setupValidForm = () => {
      component.f['fullName'].setValue('Test User');
      component.f['email'].setValue('test@email.com');
      component.f['contact'].setValue('9876543210');
      component.f['currentCity'].setValue('Bangalore');
      component.f['availableFrom'].setValue('Immediately');
      component.f['qualifications'].setValue('M.Tech');
      component.f['passedOutYear'].setValue('2015');
      component.f['experience'].setValue('Fresher');
      component.f['expectedSalary'].setValue('5LPA');
      component.f['source'].setValue('LinkedIn');
      component.f['resume'].setValue(new File([], 'test.pdf'));
      component.f['consent'].setValue(true);
      
      component.onExperienceChange({ target: { value: 'Fresher' } }); // Clear conditional validators
      expect(component.applyForm.valid).toBeTrue();
    };

    it('should NOT call saveApplication or show success toast if form is invalid', () => {
      component.submitForm();
      expect(appStorageService.saveApplication).not.toHaveBeenCalled();
      expect(toastrService.success).not.toHaveBeenCalled();
    });

    // FIX 2: Wrapped in fakeAsync/tick to resolve setTimeout and ensure emit is called
    it('should call saveApplication with correct payload and show success toast on valid submission', fakeAsync(() => { 
      setupValidForm();
      component.jobTitle = 'Test Role';
      component.jobId = 101;
      
      spyOn(component.onModalHidden, 'emit');

      component.submitForm();
      
      // Resolve the setTimeout (needed for emit and reset)
      tick(100); 

      // 1. Check Service Calls
      expect(appStorageService.saveApplication).toHaveBeenCalledTimes(1);

      // 2. Check Toast
      expect(toastrService.success).toHaveBeenCalledWith('Application submitted successfully!', 'Success');

      // 3. Check that the event is emitted
      expect(component.onModalHidden.emit).toHaveBeenCalledTimes(1); 
    }));
    
    // FIX 3: Wrapped in fakeAsync/tick to handle the submission process
    it('should show error toast if saveApplication fails (throws error)', fakeAsync(() => {
        setupValidForm();
        (appStorageService.saveApplication as jasmine.Spy).and.throwError('Save Failed');
        spyOn(component.onModalHidden, 'emit');

        component.submitForm();
        
        // Resolve the setTimeout (if used in error path)
        tick(100); 
        
        expect(toastrService.error).toHaveBeenCalledWith('Failed to submit application. Try again.', 'Error');
        expect(component.onModalHidden.emit).not.toHaveBeenCalled();
    }));
  });
});