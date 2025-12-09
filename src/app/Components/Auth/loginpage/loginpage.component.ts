import { Component, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../../Services/Auth.service';
import { Route, Router, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { NgxCaptchaModule } from 'ngx-captcha';
import { AuthLayoutComponent } from '../auth-layout/auth-layout.component';

@Component({
  selector: 'app-loginpage',
  imports: [FormsModule, NgxCaptchaModule, RouterLink, AuthLayoutComponent],
  templateUrl: './loginpage.component.html',
  styleUrl: './loginpage.component.scss',
})
export class LoginpageComponent {
  username = '';
  password = '';
  errorMessage = '';
  sitekey = environment.recaptchaSiteKey;
  captchaValid = false;

  constructor(private auth: AuthService, private router: Router) {}
  handleCaptcha(event: any) {
    this.captchaValid = true;
  }

  login() {
    if (!this.captchaValid) {
      this.errorMessage = 'Please verify the captcha.';
      return;
    }
    if (this.auth.login(this.username, this.password)) {
      // Redirect to dashboard after successful login
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage = 'Invalid username or password';
    }
  }
}
