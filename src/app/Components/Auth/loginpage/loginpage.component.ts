import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../Services/Auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { NgxCaptchaModule } from 'ngx-captcha';
import { AuthLayoutComponent } from '../auth-layout/auth-layout.component';
import { ToastrService } from 'ngx-toastr';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-loginpage',
  imports: [
    FormsModule,
    NgxCaptchaModule,
    RouterLink,
    AuthLayoutComponent,
    NgClass,
  ],
  templateUrl: './loginpage.component.html',
  styleUrl: './../auth-layout/auth-layout.component.scss',
})
export class LoginpageComponent {
  @ViewChild('captchaElem', { static: false }) captchaElem!: any;

  username = '';
  password = '';
  errorMessage = '';
  loading = false;
  sitekey = environment.recaptchaSiteKey;
  captchaValid = false;
  rememberMe = false;
  passwordVisible = false;

  readonly MSG_FILL_FIELDS = 'Please fill in all fields.';
  readonly MSG_VERIFY_CAPTCHA = 'Please verify the captcha.';
  readonly MSG_INVALID_CREDENTIALS = 'Invalid username or password';

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    const remember = localStorage.getItem('rememberMe') === 'true';

    if (remember && this.auth.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  handleCaptcha(event: any) {
    this.captchaValid = true;
  }

  onInput() {
    this.errorMessage = '';
  }

  login() {
    this.errorMessage = '';
    this.loading = true;

    // 1. Validate fields
    if (!this.username || !this.password) {
      this.toastr.error(this.MSG_FILL_FIELDS);
      this.loading = false;
      return;
    }

    if (!this.captchaValid) {
      this.toastr.error(this.MSG_VERIFY_CAPTCHA);
      this.loading = false;
      return;
    }

    // 2. Run login ONCE and store result
    const result = this.auth.login(
      this.username,
      this.password,
      this.rememberMe
    );

    // 3. Handle success or failure
    if (result) {
      this.toastr.success('Login successful!');
      const returnUrl =
        this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
      this.router.navigate([returnUrl]);
    } else {
      setTimeout(() => {
        this.toastr.error(this.MSG_INVALID_CREDENTIALS);
      }, 0);

      this.captchaValid = false;

      try {
        this.captchaElem?.resetCaptcha();
      } catch (err) {
        console.warn('Captcha reset error:', err);
      }
    }

    // 4. Stop loading
    this.loading = false;
  }
}
