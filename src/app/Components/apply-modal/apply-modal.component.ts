import { CommonModule } from '@angular/common';
import { Component, Input, OnInit,Output,EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators ,AbstractControl,ValidationErrors} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

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
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './apply-modal.component.html',
  styleUrls: ['./apply-modal.component.scss']
})
export class ApplyModalComponent implements OnInit {
  @Input() jobId: string | number | undefined; // <--- This is used for tracking applied status
  @Output() onModalHidden = new EventEmitter<void>(); // <--- Emits event to refresh the parent component

  @Input() jobTitle: string = '';
  showExperienceDetails: boolean = false;

  applyForm!: FormGroup;
  selectedFile: File | null = null; // Typing selectedFile more accurately

  constructor(private fb: FormBuilder,private toastr:ToastrService) {}

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
      
      resume: [null, Validators.required], // Use null for file control default value
      consent: [false, Validators.requiredTrue],

      // Conditional fields 
      previousCompany: [''],
      previousRole: [''],
      experienceYears: [''],
    });
  }

  get f() {
    return this.applyForm.controls;
  }

  // Dynamic experience logic 
  onExperienceChange(event: any) {
    const value = event.target.value;

    this.showExperienceDetails = value !== 'Fresher';

    const company = this.applyForm.get('previousCompany');
    const role = this.applyForm.get('previousRole');
    const expYears = this.applyForm.get('experienceYears');

    // Set or clear validators based on experience selection
    if (this.showExperienceDetails) {
      company?.setValidators([Validators.required]);
      role?.setValidators([Validators.required]);
      expYears?.setValidators([Validators.required]);
    } else {
      company?.clearValidators();
      role?.clearValidators();
      expYears?.clearValidators();

      // Clear values when switching back to Fresher
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
    this.selectedFile = files.length > 0 ? files[0] : null;
    
    // Set the control value to the file object itself or null/empty string for validation
    this.applyForm.patchValue({ resume: this.selectedFile });
    
    // Ensure the control is marked as touched/dirty to show validation state immediately
    this.applyForm.get('resume')?.markAsTouched();
  }

  // 🚀 FINAL SUBMIT FORM METHOD
  submitForm() {
    if (this.applyForm.invalid) {
      this.applyForm.markAllAsTouched();
      return;
    }

    const formData = this.applyForm.value;

    // 1. 💾 Save data to Local Storage & Track Applied ID
    try {
        const timestamp = new Date().toISOString();
        const key = `jobApplication_${timestamp}`;
        
        // Save Application Data
        const resumeName = this.selectedFile ? this.selectedFile.name : 'file_uploaded';
        const dataToStore = { ...formData, resume: resumeName };
        localStorage.setItem(key, JSON.stringify(dataToStore));
        
        console.log(`✅ Form data saved to localStorage with key: ${key}`);

        // Track Applied Job ID (New Logic for Button Update)
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
        console.error('❌ Failed to save to localStorage:', e);
    }
    
    // 2. 💡 Show Success Toast
    this.toastr.success('Application submitted successfully!', 'Success');
    
    // 3. ❌ HIDE THE MODAL AND EMIT EVENT
    const modalElement = document.getElementById('applyJobModal'); // Assuming modal ID is 'applyJobModal'
    
    // Check if the element exists and Bootstrap JS is available
    if (modalElement && (window as any).bootstrap && (window as any).bootstrap.Modal) {
        try {
            const bsModal = (window as any).bootstrap.Modal.getInstance(modalElement) || 
                            new (window as any).bootstrap.Modal(modalElement, {});
            
            // Listen for the modal hidden event
            modalElement.addEventListener('hidden.bs.modal', () => {
                this.onModalHidden.emit(); // <-- EMIT EVENT to parent component (JobDetailsComponent)
                console.log("✅ onModalHidden event emitted.");
            }, { once: true }); // Ensure the listener is removed after first execution

            bsModal.hide(); // Initiate the modal hide process
            console.log("✅ Modal hide initiated.");
            
        } catch (e) {
            console.error("❌ Failed to hide modal. Check if Bootstrap JS is fully loaded.", e);
        }
    } else {
        console.warn("⚠️ Modal element or Bootstrap JS not available for closing.");
    }
    
    // 4. Reset form data and state (This happens regardless of modal hide success)
    setTimeout(() => {
        this.applyForm.reset({
            // Provide default values for controls that were 'selected' or 'checked' 
            consent: false,
            qualifications: '',
            experience: '',
            source: ''
        });
        this.selectedFile = null;
        this.showExperienceDetails = false;
        
        // Manually clear the file input field in the DOM
        const fileInput = document.querySelector('.modal-body input[type="file"]') as HTMLInputElement;
        if (fileInput) {
             fileInput.value = '';
        }
    }, 100); 
  }
}