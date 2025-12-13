import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { RegistrationPageComponent } from './registration-page.component';
import { provideRouter, Router } from '@angular/router';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../Services/auth.service';
import { NgxCaptchaModule } from 'ngx-captcha';

/* ---------------- Fake Captcha ---------------- */
@Component({
  selector: 'ngx-recaptcha2',
  standalone: true,
  template: '',
})
class FakeRecaptchaComponent {
  @Input() siteKey!: string;
  @Output() success = new EventEmitter<string>();
}
let router: Router;
describe('RegistrationPageComponent', () => {
  let component: RegistrationPageComponent;
  let fixture: ComponentFixture<RegistrationPageComponent>;

  const authServiceMock = {
    register: jasmine.createSpy('register').and.returnValue({
      success: true,
    }),
  };
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RegistrationPageComponent,
        ReactiveFormsModule,
        FakeRecaptchaComponent,
      ],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
      ],
    })
      .overrideComponent(RegistrationPageComponent, {
        remove: {
          imports: [NgxCaptchaModule],
        },
        add: {
          imports: [FakeRecaptchaComponent],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(RegistrationPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });
  /* ---------------- TESTS ---------------- */

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize registration form', () => {
    expect(component.registerForm).toBeTruthy();
    expect(component.f['email']).toBeDefined();
    expect(component.f['password']).toBeDefined();
  });

  /* ---------------- CAPTCHA ---------------- */

  it('should mark captcha as valid when handleCaptcha is called', () => {
    component.handleCaptcha('token');
    expect(component.captchaValid).toBeTrue();
  });

  it('should show error if captcha is not verified', () => {
    component.register();

    expect(component.errorMessage).toBe('Please verify the captcha.');
  });

  /* ---------------- FORM VALIDATION ---------------- */

  it('should show error if form is invalid', () => {
    component.captchaValid = true;
    component.register();

    expect(component.errorMessage).toBe(
      'Please fill all required fields correctly.'
    );
  });

  it('should detect password mismatch', () => {
    component.registerForm.setValue({
      fullName: 'John Doe',
      email: 'john@test.com',
      username: 'john',
      password: 'Password@123',
      confirmPassword: 'Wrong@123',
    });

    expect(component.registerForm.errors).toEqual({
      passwordMismatch: true,
    });
  });

  /* ---------------- REGISTER FAILURE ---------------- */

  it('should show error if registration fails', () => {
    authServiceMock.register.and.returnValue({
      success: false,
      message: 'Username already exists',
    });

    component.captchaValid = true;

    component.registerForm.setValue({
      fullName: 'John Doe',
      email: 'john@test.com',
      username: 'john',
      password: 'Password@123',
      confirmPassword: 'Password@123',
    });

    component.register();

    expect(component.errorMessage).toBe('Username already exists');
  });

  /* ---------------- REGISTER SUCCESS ---------------- */

  it('should register successfully and navigate to profile', fakeAsync(() => {
    authServiceMock.register.and.returnValue({ success: true });
    spyOn(router, 'navigate');

    component.captchaValid = true;

    component.registerForm.setValue({
      fullName: 'John Doe',
      email: 'JOHN@TEST.COM',
      username: 'John',
      password: 'Password@123',
      confirmPassword: 'Password@123',
    });

    component.register();

    expect(component.successMessage).toContain('Registration successful');

    tick(1500);

    expect(router.navigate).toHaveBeenCalledWith(['/profile']);
  }));

  /* ---------------- DATA NORMALIZATION ---------------- */

  it('should trim and normalize form values before submit', () => {
    authServiceMock.register.and.returnValue({ success: true });

    component.captchaValid = true;

    component.registerForm.setValue({
      fullName: '  John Doe ',
      email: ' JOHN@TEST.COM ',
      username: ' John ',
      password: 'Password@123',
      confirmPassword: 'Password@123',
    });

    component.register();

    const args = authServiceMock.register.calls.mostRecent().args[0];

    expect(args.fullName).toBe('John Doe');
    expect(args.email).toBe('john@test.com');
    expect(args.username).toBe('john');
    expect(args.confirmPassword).toBeUndefined();
  });
});
