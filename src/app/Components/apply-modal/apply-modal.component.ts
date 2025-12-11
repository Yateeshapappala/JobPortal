import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators ,AbstractControl,ValidationErrors} from '@angular/forms';

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

  @Input() jobTitle: string = '';
  showExperienceDetails: boolean = false;

  applyForm!: FormGroup;
  selectedFile: File | null = null; // Typing selectedFile more accurately

  constructor(private fb: FormBuilder) {}

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

  // 🚀 FULLY FUNCTIONAL SUBMIT FORM METHOD
  submitForm() {
    if (this.applyForm.invalid) {
      this.applyForm.markAllAsTouched();
      return;
    }

    const formData = this.applyForm.value;

    // 1. 💾 Save data to Local Storage
    try {
        const timestamp = new Date().toISOString();
        const key = `jobApplication_${timestamp}`;
        
        // Prepare data for storage: replace File object with its name for JSON serialization
        const resumeName = this.selectedFile ? this.selectedFile.name : 'file_uploaded';
        const dataToStore = { ...formData, resume: resumeName };

        localStorage.setItem(key, JSON.stringify(dataToStore));
        console.log(`✅ Form data saved to localStorage with key: ${key}`);
    } catch (e) {
        console.error('❌ Failed to save to localStorage:', e);
    }
    
    // 2. 💡 Show Bootstrap Toast Notification and Hide Modal
    const toastElement = document.getElementById('successToast');
    const modalElement = document.getElementById('applyJobModal');

    // Check if Bootstrap JS is loaded on the window object
    if (toastElement && (window as any).bootstrap && (window as any).bootstrap.Toast) {
        try {
            // Show Toast
            const bsToast = new (window as any).bootstrap.Toast(toastElement);
            bsToast.show();
            console.log("✅ Toast initialized and attempting to show.");
            
            // Hide Modal
            if (modalElement) {
                 const bsModal = (window as any).bootstrap.Modal.getInstance(modalElement) || 
                                 new (window as any).bootstrap.Modal(modalElement, {});
                 bsModal.hide();
            }

        } catch (e) {
            console.error("❌ Failed to initialize/show Bootstrap components. Check Bootstrap JS loading.", e);
        }
    } else {
        console.warn("⚠️ Bootstrap components or successToast element not found.");
    }
    
    // 3. Reset form data and state (after a brief moment)
    setTimeout(() => {
        this.applyForm.reset({
            // Provide default values for controls that were 'selected' or 'checked' 
            // to avoid state issues after reset().
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