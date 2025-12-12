import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApplicationStorageService } from '../../Services/application-storage.service';
import { AuthService } from '../../Services/Auth.service';

// Custom validator for contact number
export function contactNumberValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value;

  // Must be exactly 10 digits
  if (!/^[0-9]{10}$/.test(value)) {
    return { invalidFormat: true };
  }

  // Must not contain all the same digit (0000000000, 1111111111, etc.)
  if (/^(\d)\1{9}$/.test(value)) {
    return { allSameDigits: true };
  }

  return null; // VALID
}

@Component({
  selector: 'app-apply-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './apply-modal.component.html',
  styleUrls: ['./apply-modal.component.scss']
})
export class ApplyModalComponent implements OnInit {
  @Input() jobId: string | number | undefined; // used for tracking applied status
  @Output() onModalHidden = new EventEmitter<void>(); // Emits event to refresh the parent component
  @Input() jobTitle: string = '';
  @Input() jobCompany?: string;

  showExperienceDetails: boolean = false;
  applyForm!: FormGroup;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private appStorage: ApplicationStorageService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.applyForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contact: ['', [Validators.required, contactNumberValidator]],
      currentCity: ['', Validators.required],
      availableFrom: ['', Validators.required],
      linkedin: [''],

      qualifications: ['', Validators.required],
      passedOutYear: ['', Validators.required],
      experience: ['', Validators.required],
      expectedSalary: ['', Validators.required],
      source: ['', Validators.required],

      resume: [null, Validators.required],
      consent: [false, Validators.requiredTrue],

      previousCompany: [''],
      previousRole: [''],
      experienceYears: [''],
    });
  }

  get f() {
    return this.applyForm.controls;
  }

  onExperienceChange(event: any) {
    const value = event.target.value;
    this.showExperienceDetails = value !== 'Fresher';

    const company = this.applyForm.get('previousCompany');
    const role = this.applyForm.get('previousRole');
    const expYears = this.applyForm.get('experienceYears');

    if (this.showExperienceDetails) {
      company?.setValidators([Validators.required]);
      role?.setValidators([Validators.required]);
      expYears?.setValidators([Validators.required]);
    } else {
      company?.clearValidators();
      role?.clearValidators();
      expYears?.clearValidators();
      company?.setValue('');
      role?.setValue('');
      expYears?.setValue('');
    }

    company?.updateValueAndValidity();
    role?.updateValueAndValidity();
    expYears?.updateValueAndValidity();
  }

  onFileSelect(event: any) {
    const files = event.target.files;
    this.selectedFile = files && files.length > 0 ? files[0] : null;
    this.applyForm.patchValue({ resume: this.selectedFile });
    this.applyForm.get('resume')?.markAsTouched();
  }

  // Final submit: save into ApplicationStorageService (and keep appliedJobIds tracking)
  submitForm() {
    if (this.applyForm.invalid) {
      this.applyForm.markAllAsTouched();
      return;
    }

    const formData = this.applyForm.value;

    try {
      const user = this.auth.getUser();
      const nowIso = new Date().toISOString();
      const resumeName = this.selectedFile ? this.selectedFile.name : (formData.resume || 'file_uploaded');

      // Build partial app record to save into ApplicationStorageService
      const appRecord: Partial<any> = {
        jobTitle: this.jobTitle || formData.jobTitle || 'Unknown Role',
        company: this.jobCompany || formData.company || 'Unknown Company',
        dateApplied: nowIso,
        resume: resumeName,
        status: 'IN-REVIEW',
        // keep full payload for details
        fullName: formData.fullName,
        email: formData.email,
        contact: formData.contact,
        currentCity: formData.currentCity,
        availableFrom: formData.availableFrom,
        linkedin: formData.linkedin,
        qualifications: formData.qualifications,
        passedOutYear: formData.passedOutYear,
        experience: formData.experience,
        expectedSalary: formData.expectedSalary,
        source: formData.source,
        previousCompany: formData.previousCompany,
        previousRole: formData.previousRole,
        experienceYears: formData.experienceYears,
        jobId: this.jobId
      };

      // Save via central storage service (this will emit and update lists/stats)
      const saved = this.appStorage.saveApplication(appRecord, user?.email);
      console.log('✅ Application saved via ApplicationStorageService', saved);

      // Track Applied Job ID (keeps job detail button state working)
      if (this.jobId) {
        const appliedJobsKey = 'appliedJobIds';
        const existingAppliedIds: (string | number)[] = JSON.parse(localStorage.getItem(appliedJobsKey) || '[]');

        if (!existingAppliedIds.some(id => String(id) === String(this.jobId))) {
          existingAppliedIds.push(this.jobId);
          localStorage.setItem(appliedJobsKey, JSON.stringify(existingAppliedIds));
          console.log(`✅ Job ID ${this.jobId} marked as applied.`);
        }
      }
    } catch (e) {
      console.error('❌ Failed to save application', e);
      this.toastr.error('Failed to submit application. Try again.', 'Error');
      return;
    }

    // Show toast
    this.toastr.success('Application submitted successfully!', 'Success');

    // Hide modal and emit event once hidden
    const modalElement = document.getElementById('applyJobModal');
    if (modalElement && (window as any).bootstrap && (window as any).bootstrap.Modal) {
      try {
        modalElement.addEventListener('hidden.bs.modal', () => {
          this.onModalHidden.emit();
          console.log('✅ onModalHidden event emitted.');
        }, { once: true });

        const bsModal = (window as any).bootstrap.Modal.getInstance(modalElement) ||
                        new (window as any).bootstrap.Modal(modalElement, {});
        bsModal.hide();
      } catch (e) {
        console.error('❌ Failed to hide modal. Check Bootstrap JS.', e);
      }
    } else {
      // If bootstrap not available, still emit so parent can update
      setTimeout(() => this.onModalHidden.emit(), 50);
      console.warn('⚠️ Modal element or Bootstrap not available to hide programmatically.');
    }

    // Reset form
    setTimeout(() => {
      this.applyForm.reset({
        consent: false,
        qualifications: '',
        experience: '',
        source: ''
      });
      this.selectedFile = null;
      this.showExperienceDetails = false;

      const fileInput = document.querySelector('.modal-body input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }, 100);
  }
}
