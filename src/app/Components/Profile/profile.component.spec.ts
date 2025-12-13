import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileComponent } from './profile.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { ProfileService } from '../../Services/profile.service';
import { ElementRef } from '@angular/core';
import { User } from '../../Models/user.model';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  /* ---------- MOCK PROFILE SERVICE ---------- */
  const userSubject = new Subject<User | null>();

  const profileServiceMock = {
  user$: userSubject.asObservable(),
  updateSection: jasmine.createSpy('updateSection'),
  getCurrentUser: jasmine.createSpy('getCurrentUser').and.returnValue({
    fullName: 'John Doe',
    email: 'john@test.com',
    username: 'johndoe',
  }),
};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProfileComponent,
        BrowserAnimationsModule,
        ToastrModule.forRoot(),
      ],
      providers: [{ provide: ProfileService, useValue: profileServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    component.photoInput = {
      nativeElement: {
        click: jasmine.createSpy('click'),
      },
    } as ElementRef;
    fixture.detectChanges();
  });

  /* ---------- TESTS ---------- */

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /* ---------- INIT ---------- */

  it('should subscribe to user$ on init and set user', () => {
     const mockUser: User = {
    fullName: 'John Doe',
    email: 'john@test.com',
    username: 'johndoe',
  };
   userSubject.next(mockUser);

  expect(component.user).toEqual(mockUser);
});

  /* ---------- PHOTO MENU ---------- */

  it('should toggle photo menu', () => {
    component.showPhotoMenu = false;
    component.togglePhotoMenu();
    expect(component.showPhotoMenu).toBeTrue();

    component.togglePhotoMenu();
    expect(component.showPhotoMenu).toBeFalse();
  });

  /* ---------- PHOTO UPLOAD ---------- */

 it('should trigger photo upload input click', () => {
  component.showPhotoMenu = true;

  const clickSpy = spyOn(
    component.photoInput.nativeElement,
    'click'
  );

  component.triggerPhotoUpload();

  expect(component.showPhotoMenu).toBeFalse();
  expect(clickSpy).toHaveBeenCalled();
});


  it('should remove photo and update profile service', () => {
    component.showPhotoMenu = true;

    component.removePhoto();

    expect(profileServiceMock.updateSection).toHaveBeenCalledWith(
      'profilePic',
      null
    );
    expect(component.showPhotoMenu).toBeFalse();
  });

  /* ---------- UPDATE PHOTO ---------- */

  it('should update photo when file is selected', () => {
    const mockFile = new Blob(['test'], { type: 'image/png' });
    const event = {
      target: {
        files: [mockFile],
      },
    };

    // Spy on FileReader
    spyOn(window as any, 'FileReader').and.returnValue({
      readAsDataURL: function () {
        this.onload();
      },
      onload: null,
      result: 'data:image/png;base64,test',
    });

    component.updatePhoto(event);

    expect(profileServiceMock.updateSection).toHaveBeenCalledWith(
      'profilePic',
      'data:image/png;base64,test'
    );
  });

 it('should do nothing if no file is selected', () => {
  profileServiceMock.updateSection.calls.reset();

  const event = { target: { files: [] } };

  component.updatePhoto(event);

  expect(profileServiceMock.updateSection).not.toHaveBeenCalled();
});

});
