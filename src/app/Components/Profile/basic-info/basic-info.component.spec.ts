import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BasicInfoComponent } from './basic-info.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrService } from 'ngx-toastr';
import { ProfileService } from '../../../Services/profile.service';
import { ElementRef } from '@angular/core';
import { User } from '../../../Models/user.model';

describe('BasicInfoComponent', () => {
  let component: BasicInfoComponent;
  let fixture: ComponentFixture<BasicInfoComponent>;

  /* ---------- MOCK USER ---------- */
  const mockUser: User = {
    fullName: 'John Doe',
    email: 'john@test.com',
    username: 'john',
    profilePic: 'pic.png',
  } as User;

  /* ---------- MOCK SERVICES ---------- */
  const profileServiceMock = {
    getCurrentUser: jasmine.createSpy('getCurrentUser'),
    updateUser: jasmine.createSpy('updateUser'),
  };

  const toastrMock = {
    success: jasmine.createSpy('success'),
  };

  beforeEach(async () => {
    // ✅ return user by default
    profileServiceMock.getCurrentUser.and.returnValue(mockUser);

    await TestBed.configureTestingModule({
      imports: [BasicInfoComponent, BrowserAnimationsModule],
      providers: [
        { provide: ProfileService, useValue: profileServiceMock },
        { provide: ToastrService, useValue: toastrMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BasicInfoComponent);
    component = fixture.componentInstance;

    // ✅ mock ViewChild manually
    component.fileInput = {
      nativeElement: {
        click: jasmine.createSpy('click'),
      },
    } as ElementRef;

    fixture.detectChanges(); // ngOnInit runs here
  });

  /* ---------- BASIC ---------- */

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /* ---------- INIT ---------- */

  it('should load user and initialize form on init', () => {
    expect(profileServiceMock.getCurrentUser).toHaveBeenCalled();
    expect(component.form.value.fullName).toBe('John Doe');
    expect(component.previewPic).toBe('pic.png');
  });

  /* ---------- DOB VALIDATOR ---------- */

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

  /* ---------- IMAGE ---------- */


  it('should set preview image when file selected', () => {
    const mockFile = new Blob(['img'], { type: 'image/png' });

    spyOn(window as any, 'FileReader').and.returnValue({
      readAsDataURL() {
        this.onload();
      },
      onload: null,
      result: 'data:image/png;base64,test',
    });

    component.pickPic({
      target: { files: [mockFile] },
    });

    expect(component.previewPic).toBe('data:image/png;base64,test');
  });

  /* ---------- SAVE ---------- */

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
