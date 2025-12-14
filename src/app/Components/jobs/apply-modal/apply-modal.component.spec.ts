import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';

// External libraries
import { ToastrService } from 'ngx-toastr';

// Component and Validator to test
import { ApplyModalComponent, contactNumberValidator } from './apply-modal.component';

// Services
import { ApplicationStorageService } from '../../../Services/application-storage.service';
import { AuthService } from '../../../Services/auth.service';

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

    // Helper to setup a completely valid form state
    const setupValidForm = (experience: 'Fresher' | 'Experienced' = 'Fresher') => {
        component.f['fullName'].setValue('Test User');
        component.f['email'].setValue('test@email.com');
        component.f['contact'].setValue('9876543210');
        component.f['currentCity'].setValue('Bangalore');
        component.f['availableFrom'].setValue('Immediately');
        component.f['qualifications'].setValue('M.Tech');
        component.f['passedOutYear'].setValue('2015');
        component.f['experience'].setValue(experience);
        component.f['expectedSalary'].setValue('5LPA');
        component.f['source'].setValue('LinkedIn');
        component.f['resume'].setValue(new File([], 'test.pdf'));
        component.f['consent'].setValue(true);

        // Run the experience change logic to handle validators
        component.onExperienceChange({ target: { value: experience } }); 

        if (experience === 'Experienced') {
            component.f['previousCompany'].setValue('Old Co');
            component.f['previousRole'].setValue('Lead');
            component.f['experienceYears'].setValue('5');
        }

        expect(component.applyForm.valid).toBeTrue();
    };

    beforeEach(async () => {
        // Mock global DOM element and Bootstrap for modal tests
        const modalEl = document.createElement('div');
        modalEl.id = 'applyJobModal';
        document.body.appendChild(modalEl);

        // Spy on localStorage getItem/setItem to mock tracking applied IDs
        spyOn(localStorage, 'getItem').and.callFake((key: string) => {
            if (key === 'appliedJobIds') return JSON.stringify([]);
            return null;
        });
        spyOn(localStorage, 'setItem').and.callThrough();

        localStorage.clear();

        await TestBed.configureTestingModule({
            imports: [ApplyModalComponent, CommonModule, ReactiveFormsModule],
            providers: [
                FormBuilder,
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

    afterEach(() => {
        // Cleanup global mock element
        const modalEl = document.getElementById('applyJobModal');
        if (modalEl) document.body.removeChild(modalEl);
        
        // Restore spies
        (localStorage.getItem as jasmine.Spy).and.callThrough();
        (localStorage.setItem as jasmine.Spy).and.callThrough();
    });

    it('should create the component and initialize the form', () => {
        expect(component).toBeTruthy();
        expect(Object.keys(component.applyForm.controls).length).toBe(16); 
    });

    // --- Custom Contact Validator Tests (COV FIX: Lines 18, 23) ---
    describe('Custom Contact Number Validator', () => {
        const validator = contactNumberValidator;
        let control: AbstractControl;

        it('should be valid for a 10-digit unique number', () => {
            control = { value: '1234567890' } as AbstractControl;
            expect(validator(control)).toBeNull();
        });

        // COV FIX: Test invalid format (length)
        it('should return invalidFormat for a number not exactly 10 digits', () => {
            control = { value: '123' } as AbstractControl; 
            expect(validator(control)).toEqual({ invalidFormat: true });
        });
        
        // COV FIX: Test all same digits
        it('should return allSameDigits for a number with 10 identical digits', () => {
            control = { value: '9999999999' } as AbstractControl;
            expect(validator(control)).toEqual({ allSameDigits: true });
        });
    });

    // --- Conditional Validation (Experience) Tests ---
    describe('Conditional Validation (Experience)', () => {
        const experienceFields = ['previousCompany', 'previousRole', 'experienceYears'];

        it('should REQUIRE experience details for "Experienced"', () => {
            component.onExperienceChange({ target: { value: 'Experienced' } });
            
            experienceFields.forEach(field => {
                expect(component.f[field].hasValidator(Validators.required)).toBeTrue();
                expect(component.f[field].value).toBe(''); // Should not clear value
            });
            expect(component.showExperienceDetails).toBeTrue();
        });
        
        it('should CLEAR experience details for "Fresher"', () => {
            // Setup as experienced first
            component.onExperienceChange({ target: { value: 'Experienced' } });
            component.f['previousCompany'].setValue('Old Co');
            
            // Change to fresher
            component.onExperienceChange({ target: { value: 'Fresher' } });
            
            experienceFields.forEach(field => {
                expect(component.f[field].hasValidator(Validators.required)).toBeFalse();
                expect(component.f[field].value).toBe(''); // Should clear the value (COV FIX)
            });
            expect(component.showExperienceDetails).toBeFalse();
        });
    });
    
    // --- File Selection Tests (COV FIX: Added Test) ---
    it('should correctly select a file and update the form', () => {
        const mockFile = new File([''], 'test.pdf', { type: 'application/pdf' });
        const mockEvent = { target: { files: [mockFile] } };

        component.onFileSelect(mockEvent);

        expect(component.selectedFile).toBe(mockFile);
        expect(component.f['resume'].value).toBe(mockFile);
        expect(component.f['resume'].touched).toBeTrue();
    });

    // --- Form Submission Tests ---
    describe('Form Submission', () => {
        
        // COV FIX: Test invalid form submission (Line 172)
        it('should mark form as touched and return if form is invalid', () => {
            spyOn(component.applyForm, 'markAllAsTouched');
            
            // Form is invalid by default (missing fields)
            component.submitForm();
            
            expect(component.applyForm.markAllAsTouched).toHaveBeenCalled();
            expect(appStorageService.saveApplication).not.toHaveBeenCalled();
        });

        it('should save and show success toast on valid submission (Fresher)', fakeAsync(() => { 
            setupValidForm();
            component.jobId = 101;
            
            // Mock Bootstrap for modal close success path (COV FIX)
            (window as any).bootstrap = {
                Modal: class {
                    constructor() {}
                    hide = jasmine.createSpy('hide');
                    static getInstance = () => new (window as any).bootstrap.Modal();
                }
            };

            component.submitForm();
            
            // Check application save
            expect(appStorageService.saveApplication).toHaveBeenCalled();
            
            // Check applied ID tracking
            expect(localStorage.setItem).toHaveBeenCalledWith('appliedJobIds', JSON.stringify([101]));
            
            // Check success toast
            expect(toastrService.success).toHaveBeenCalledWith('Application submitted successfully!', 'Success');

            // Resolve setTimeouts (reset form, emit event)
            tick(100); 

            // Check form reset and emission
            expect(component.applyForm.value.fullName).toBe(null);
            expect(component.applyForm.value.consent).toBe(false);
            expect(component.selectedFile).toBeNull();
            
            // Cleanup global mock
            delete (window as any).bootstrap;
        }));

        // COV FIX: Test failure in save application (Line 175)
        it('should show error toast if saveApplication fails (throws error)', () => {
            setupValidForm();
            (appStorageService.saveApplication as jasmine.Spy).and.throwError('Save Failed');
            spyOn(console, 'error');
            
            component.submitForm();
            
            expect(toastrService.error).toHaveBeenCalledWith('Failed to submit application. Try again.', 'Error');
            expect(console.error).toHaveBeenCalled();
            
            // Restore spy for other tests
            (appStorageService.saveApplication as jasmine.Spy).and.callThrough();
        });
        
        // COV FIX: Test no Bootstrap JS (Line 206)
        it('should emit onModalHidden using setTimeout if Bootstrap is not available', fakeAsync(() => {
            setupValidForm();
            // Ensure Bootstrap is missing
            delete (window as any).bootstrap;
            spyOn(component.onModalHidden, 'emit');

            component.submitForm();
            
            // Act: Execute the setTimeout on the 'else' path
            tick(50); 
            
            // Assert: Emit is called
            expect(component.onModalHidden.emit).toHaveBeenCalledTimes(1);
        }));

        // COV FIX: Test Bootstrap Modal hide failure (Line 204)
        it('should handle modal hiding failure when Bootstrap hide throws an error', fakeAsync(() => {
            setupValidForm();
            spyOn(console, 'error');
            
            // Arrange: Mock Bootstrap existence and force the hide call to fail
            (window as any).bootstrap = {
                Modal: class {
                    constructor() {}
                    hide = jasmine.createSpy('hide').and.throwError('Bootstrap Hide Error'); // Mocking the failure
                    static getInstance = () => new (window as any).bootstrap.Modal();
                }
            };
            
            component.submitForm();
            tick(); // Execute async listeners/promises if any

            // Assert: The catch block for modal hiding is hit
            expect(console.error).toHaveBeenCalledWith(
                '❌ Failed to hide modal. Check Bootstrap JS.', 
                jasmine.any(Error)
            );
            
            // Cleanup global mock
            delete (window as any).bootstrap;
        }));
    });
});