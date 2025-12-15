import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BasicInfoComponent } from './basic-info.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrService } from 'ngx-toastr';
import { ProfileService } from '../../../Services/profile.service';
import { User } from '../../../Models/user.model';
import { BehaviorSubject } from 'rxjs';

describe('BasicInfoComponent', () => {
  let component: BasicInfoComponent;
  let fixture: ComponentFixture<BasicInfoComponent>;

  const mockUser: User = {
    fullName: 'John Doe',
    email: 'john@test.com',
    username: 'john',
    profilePic: 'pic.png',
  } as User;

  const userSubject = new BehaviorSubject<User | null>(mockUser);

  const profileServiceMock = {
    user$: userSubject.asObservable(),
    updateUser: jasmine.createSpy('updateUser'),
  };

  const toastrMock = {
    success: jasmine.createSpy('success'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicInfoComponent, BrowserAnimationsModule],
      providers: [
        { provide: ProfileService, useValue: profileServiceMock },
        { provide: ToastrService, useValue: toastrMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BasicInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // ngOnInit runs
  });

  //TESTS
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user and initialize form on init', () => {
    expect(component.form.value.fullName).toBe('John Doe');
  });

  it('should invalidate future DOB', () => {
    const control = component.form.controls['dob'];
    control.setValue('3000-01-01');
    expect(control.errors).toEqual({ invalidDob: true });
  });

  it('should accept valid DOB (18+)', () => {
    const control = component.form.controls['dob'];
    control.setValue('1990-01-01');
    expect(control.errors).toBeNull();
  });

  it('should update user and emit saved event', () => {
    spyOn(component.saved, 'emit');

    component.save();

    expect(profileServiceMock.updateUser).toHaveBeenCalled();
    expect(toastrMock.success).toHaveBeenCalledWith(
      'Profile updated successfully'
    );
    expect(component.saved.emit).toHaveBeenCalled();
  });
});
