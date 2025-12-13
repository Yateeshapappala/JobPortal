import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdditionalInfoComponent } from './additional-info.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { ProfileService } from '../../../Services/profile.service';
import { Subject } from 'rxjs';
import { User } from '../../../Models/user.model';

describe('AdditionalInfoComponent', () => {
  let component: AdditionalInfoComponent;
  let fixture: ComponentFixture<AdditionalInfoComponent>;

  /* ---------------- MOCKS ---------------- */

  const userSubject = new Subject<User | null>();

  const profileServiceMock = {
    user$: userSubject.asObservable(),
    updateSection: jasmine.createSpy('updateSection'),
  };

  const toastrMock = {
    success: jasmine.createSpy('success'),
    error: jasmine.createSpy('error'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AdditionalInfoComponent,
        BrowserAnimationsModule,
        ToastrModule.forRoot(),
      ],
      providers: [
        { provide: ProfileService, useValue: profileServiceMock },
        { provide: ToastrService, useValue: toastrMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdditionalInfoComponent);
    component = fixture.componentInstance;
    profileServiceMock.updateSection.calls.reset();
  toastrMock.error.calls.reset();
  toastrMock.success.calls.reset();
    fixture.detectChanges();
  });

  /* ---------------- TESTS ---------------- */

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /* ---------------- INIT ---------------- */

  it('should initialize form and patch values from user$', () => {
    const mockUser: User = {
      username: 'john',
      email: 'john@test.com',
      fullName: 'John Doe',
      additional: {
        languages: ['English', 'French'],
        certifications: ['AWS'],
        achievements: ['Employee of the Month'],
      },
    };

    userSubject.next(mockUser);

    expect(component.form.value.languages).toBe('English, French');
    expect(component.form.value.certifications).toBe('AWS');
    expect(component.form.value.achievements).toBe('Employee of the Month');
  });

  /* ---------------- SAVE VALIDATION ---------------- */

  it('should show error if form is invalid', () => {
    component.form.patchValue({
      languages: '123', // invalid pattern
    });

    component.save();

    expect(toastrMock.error).toHaveBeenCalledWith(
      'Please fix validation errors.'
    );
    expect(profileServiceMock.updateSection).not.toHaveBeenCalled();
  });

  it('should show error if user is not loaded', () => {
    component.form.patchValue({
      languages: 'English',
      certifications: 'AWS',
      achievements: 'Award',
    });

    component.user = null;

    component.save();

    expect(toastrMock.error).toHaveBeenCalledWith('User not loaded');
    expect(profileServiceMock.updateSection).not.toHaveBeenCalled();
  });

  /* ---------------- SAVE SUCCESS ---------------- */

  it('should save additional info and emit saved event', () => {
    const mockUser: User = {
      username: 'john',
      email: 'john@test.com',
      fullName: 'John Doe',
      additional: {},
    };

    userSubject.next(mockUser);

    component.form.patchValue({
      languages: 'English, French',
      certifications: 'AWS, Azure',
      achievements: 'Top Performer',
    });

    spyOn(component.saved, 'emit');

    component.save();

    expect(profileServiceMock.updateSection).toHaveBeenCalledWith(
      'additional',
      {
        languages: ['English', 'French'],
        certifications: ['AWS', 'Azure'],
        achievements: ['Top Performer'],
      }
    );

    expect(toastrMock.success).toHaveBeenCalledWith(
      'Additional info updated'
    );
    expect(component.saved.emit).toHaveBeenCalled();
  });
});
