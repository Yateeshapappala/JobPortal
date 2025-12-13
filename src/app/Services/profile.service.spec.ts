import { TestBed } from '@angular/core/testing';
import { ProfileService } from './profile.service';
import { User } from '../Models/user.model';

describe('ProfileService', () => {
  let service: ProfileService;

  const mockUser: User = {
    username: 'john',
    fullName: 'John Doe',
    email: 'john@test.com',
    profilePic: 'pic.png',
    skills: ['Angular'],
  } as User;

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  function createService() {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProfileService);
  }

  /* ------------------ BASIC ------------------ */

  it('should be created', () => {
    createService();
    expect(service).toBeTruthy();
  });

  /* ------------------ INIT ------------------ */

  it('should load user from localStorage on init', () => {
    localStorage.setItem('user', JSON.stringify(mockUser));

    createService();

    expect(service.getCurrentUser()).toEqual(mockUser);
  });

  /* ------------------ UPDATE SECTION ------------------ */

  it('should update a specific section of user', () => {
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('users', JSON.stringify([mockUser]));

    createService();

    service.updateSection('profilePic', 'new-pic.png');

    const updatedUser = service.getCurrentUser();
    expect(updatedUser?.profilePic).toBe('new-pic.png');

    const stored = JSON.parse(localStorage.getItem('user')!);
    expect(stored.profilePic).toBe('new-pic.png');
  });

  it('should not update section if user is null', () => {
    createService();
    spyOn(localStorage, 'setItem');

    service.updateSection('profilePic', 'x');

    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  /* ------------------ UPDATE USER ------------------ */

  it('should update entire user object', () => {
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('users', JSON.stringify([mockUser]));

    createService();

    service.updateUser({
      ...mockUser,
      fullName: 'Updated Name',
    });

    expect(service.getCurrentUser()?.fullName).toBe('Updated Name');
  });

  /* ------------------ OBSERVABLE ------------------ */

  it('should emit updated user via user$', (done) => {
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('users', JSON.stringify([mockUser]));

    createService();

    service.user$.subscribe((u) => {
      if (u?.fullName === 'New Name') {
        expect(u.fullName).toBe('New Name');
        done();
      }
    });

    service.updateUser({
      ...mockUser,
      fullName: 'New Name',
    });
  });
});
