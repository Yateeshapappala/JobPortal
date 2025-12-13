import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginpageComponent } from './loginpage.component';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthService } from '../../../Services/auth.service';
import { NgxCaptchaModule } from 'ngx-captcha';

/* ------------------ Fake reCAPTCHA ------------------ */
@Component({
  selector: 'ngx-recaptcha2',
  standalone: true,
  template: '',
})
class FakeCaptchaComponent {
  @Input() siteKey!: string;
  @Output() success = new EventEmitter<string>();
  resetCaptcha() {}
}

let router: Router;
describe('LoginpageComponent', () => {
  let component: LoginpageComponent;
  let fixture: ComponentFixture<LoginpageComponent>;
  const toastrMock = {
    success: jasmine.createSpy('success'),
    error: jasmine.createSpy('error'),
  };

  const authServiceMock = {
    login: jasmine.createSpy('login'),
    isLoggedIn: jasmine.createSpy('isLoggedIn').and.returnValue(false),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoginpageComponent,
        BrowserAnimationsModule,
        ToastrModule.forRoot(),
        FakeCaptchaComponent,
      ],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: ToastrService, useValue: toastrMock },
      ],
    })
      .overrideComponent(LoginpageComponent, {
        remove: {
          imports: [NgxCaptchaModule],
        },
        add: {
          imports: [FakeCaptchaComponent],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(LoginpageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture.detectChanges();
    component.captchaElem = {
      resetCaptcha: jasmine.createSpy('resetCaptcha'),
    };
  });

  /* ------------------ TESTS ------------------ */

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error if fields are empty', () => {
    component.login();

    expect(toastrMock.error).toHaveBeenCalledWith(component.MSG_FILL_FIELDS);
    expect(component.loading).toBeFalse();
  });

  it('should show error if captcha is not verified', () => {
    component.username = 'test';
    component.password = 'Password@123';
    component.captchaValid = false;

    component.login();

    expect(toastrMock.error).toHaveBeenCalledWith(component.MSG_VERIFY_CAPTCHA);
    expect(component.loading).toBeFalse();
  });

  it('should login successfully and navigate', () => {
    authServiceMock.login.and.returnValue(true);

    component.username = 'test';
    component.password = 'Password@123';
    component.captchaValid = true;

    component.login();

    expect(authServiceMock.login).toHaveBeenCalled();
    expect(toastrMock.success).toHaveBeenCalled();
  });

  it('should show error on invalid credentials and reset captcha', () => {
    jasmine.clock().install();
    authServiceMock.login.and.returnValue(false);

    component.username = 'test';
    component.password = 'wrong';
    component.captchaValid = true;

    component.login();
    jasmine.clock().tick(0);

    expect(toastrMock.error).toHaveBeenCalledWith(
      component.MSG_INVALID_CREDENTIALS
    );
    expect(component.captchaElem.resetCaptcha).toHaveBeenCalled();
    expect(component.captchaValid).toBeFalse();
  });

  it('should redirect to dashboard if rememberMe and already logged in', () => {
    spyOn(localStorage, 'getItem').and.returnValue('true');
    authServiceMock.isLoggedIn.and.returnValue(true);

    component.ngOnInit();

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should clear error message on input', () => {
    component.errorMessage = 'Error';
    component.onInput();
    expect(component.errorMessage).toBe('');
  });
});
