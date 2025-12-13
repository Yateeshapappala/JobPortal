import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationPageComponent } from './registration-page.component';
import { provideRouter } from '@angular/router';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../Services/Auth.service';
@Component({
  selector: 'ngx-recaptcha2',
  standalone: true,
  template: '',
})
class FakeRecaptchaComponent {
  @Input() siteKey!: string;
  @Output() success = new EventEmitter<string>();
}
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
      imports: [RegistrationPageComponent,ReactiveFormsModule,FakeRecaptchaComponent],
      providers: [provideRouter([]),
    {provide: AuthService, useValue: authServiceMock}],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
