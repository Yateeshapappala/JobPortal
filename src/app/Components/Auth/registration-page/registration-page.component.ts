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
import { emailUniqueValidator } from '../../../Validators/unique-email.validator';
import { usernameUniqueValidator } from '../../../Validators/username-unique.validator';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-registration-page',
  imports: [
    ReactiveFormsModule,
    NgxCaptchaModule,
    RouterLink,
    AuthLayoutComponent,
    NgClass
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
  passwordVisible = false;
  showpassword = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.registerForm = this.fb.group(
      {
        fullName: ['', Validators.required],
        email: [
          '',
          [Validators.required, Validators.email],
          [emailUniqueValidator()],
        ],
        username: ['', Validators.required, [usernameUniqueValidator()]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*]).{8,}$'
            ),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  // Password Match Validation
  passwordMatchValidator(form: FormGroup) {
  const password = form.get('password')?.value;
  const confirm = form.get('confirmPassword')?.value;

  return password && confirm && password !== confirm
    ? { passwordMismatch: true }
    : null;
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
    const formValue = this.registerForm.value;

    formValue.username = formValue.username.trim().toLowerCase();
    formValue.email = formValue.email.trim().toLowerCase();
    formValue.fullName = formValue.fullName.trim();

    const result = this.auth.register(formValue);

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
