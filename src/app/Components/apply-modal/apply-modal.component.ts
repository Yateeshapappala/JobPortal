import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

// Custom validator outside the class
export function validPhoneNumber(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  // Must be 10 digits
  if (!/^\d{10}$/.test(value)) return { invalidLength: true };

  // Cannot be all the same digit
  if (/^(\d)\1{9}$/.test(value)) return { repeatedDigits: true };

  // Cannot start with 0
  if (/^0/.test(value)) return { startsWithZero: true };

  return null; // valid
}

@Component({
  selector: 'app-apply-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './apply-modal.component.html'
})
export class ApplyModalComponent {

  @Input() jobTitle: string = '';
  applyForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.applyForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contact: ['', [Validators.required, validPhoneNumber]],
      experience: ['', Validators.required],
      expectedSalary: ['', Validators.required],
      linkedin: [''],
      availableFrom: ['', Validators.required],
      resume: [null, Validators.required]
    });
  }

  

  onFileSelect(event: any) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      // Save file content as Base64 in the form control
      this.applyForm.patchValue({ resume: reader.result });
    };
    reader.readAsDataURL(file); // Converts file to Base64 string
  }
}

submitForm() {
  if (this.applyForm.invalid) {
    this.applyForm.markAllAsTouched();
    return;
  }

  // Save application to localStorage
  let apps = JSON.parse(localStorage.getItem('applications') || '[]');
  apps.push(this.applyForm.value);
  localStorage.setItem('applications', JSON.stringify(apps));

  // Show success toast
  const toast = document.getElementById('successToast');
  // @ts-ignore
  const bsToast = new bootstrap.Toast(toast);
  bsToast.show();

  // Reset the form
  this.applyForm.reset();
}


  get f() {
    return this.applyForm.controls;
  }
}
