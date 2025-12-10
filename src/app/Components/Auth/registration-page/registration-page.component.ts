import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../../../Services/Auth.service';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { NgxCaptchaModule } from 'ngx-captcha';
import { AuthLayoutComponent } from '../auth-layout/auth-layout.component';

@Component({
  selector: 'app-registration-page',
  imports: [
    ReactiveFormsModule,
    NgxCaptchaModule,
    RouterLink,
    AuthLayoutComponent,
  ],
  templateUrl: './registration-page.component.html',
  styleUrl: './registration-page.component.scss',
})
export class RegistrationPageComponent {
  registerForm!: FormGroup;
  submitted = false;

  sitekey = environment.recaptchaSiteKey;
  captchaValid = false;

  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.registerForm = this.fb.group(
      {
        fullName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        username: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  // Password Match Validation
  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null
      : { passwordMismatch: true };
  }

  get f() {
    return this.registerForm.controls;
  }

  handleCaptcha(token: string) {
    this.captchaValid = true;
  }

  register() {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.captchaValid) {
      this.errorMessage = 'Please verify the captcha.';
      return;
    }

    if (this.registerForm.invalid) {
      this.errorMessage = 'Please fill all required fields correctly.';
      return;
    }

    const result = this.auth.register(this.registerForm.value);

    if (!result.success) {
      this.errorMessage = result.message;
      return;
    }

    this.successMessage = 'Registration successful! Redirecting...';

    setTimeout(() => {
      this.router.navigate(['/profile']);
    }, 1500);
  }
}
