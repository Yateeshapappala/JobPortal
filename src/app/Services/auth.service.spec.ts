import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { take } from 'rxjs/operators';

describe('AuthService', () => {
  let service: AuthService;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(() => {
    localStorage.clear();

    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  /* ---------- LOGIN ---------- */

  it('should login successfully with valid credentials', () => {
    const hashed = CryptoJS.SHA256('Password@123').toString();

    localStorage.setItem(
      'users',
      JSON.stringify([
        {
          username: 'john',
          password: hashed,
          fullName: 'John Doe',
          email: 'john@test.com',
        },
      ])
    );

    service = TestBed.inject(AuthService);

    const result = service.login('john', 'Password@123', false);

    expect(result).toBeTrue();
    expect(localStorage.getItem('token')).toBeTruthy();
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('should fail login with invalid credentials', () => {
    service = TestBed.inject(AuthService);

    const result = service.login('wrong', 'wrong', false);
    expect(result).toBeFalse();
  });

  /* ---------- REGISTER ---------- */

  it('should register a new user successfully', () => {
    service = TestBed.inject(AuthService);

    const result = service.register({
      username: 'newuser',
      password: 'Password@123',
      fullName: 'New User',
      email: 'new@test.com',
    });

    expect(result.success).toBeTrue();

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    expect(users.length).toBe(1);
  });

  it('should not allow duplicate username', () => {
    localStorage.setItem(
      'users',
      JSON.stringify([
        {
          username: 'john',
          password: '123',
          fullName: 'John',
          email: 'john@test.com',
        },
      ])
    );

    service = TestBed.inject(AuthService);

    const result = service.register({
      username: 'john',
      password: 'Password@123',
      fullName: 'Another',
      email: 'another@test.com',
    });

    expect(result.success).toBeFalse();
    expect(result.message).toContain('Username already exists');
  });

  it('should not allow duplicate email', () => {
    localStorage.setItem(
      'users',
      JSON.stringify([
        {
          username: 'john',
          password: '123',
          fullName: 'John',
          email: 'john@test.com',
        },
      ])
    );

    service = TestBed.inject(AuthService);

    const result = service.register({
      username: 'new',
      password: 'Password@123',
      fullName: 'Another',
      email: 'john@test.com',
    });

    expect(result.success).toBeFalse();
    expect(result.message).toContain('Email already exists');
  });

  /* ---------- LOGOUT ---------- */

  it('should logout user and navigate to home', () => {
    service = TestBed.inject(AuthService);

    localStorage.setItem('token', 'dummy');

    service.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(routerMock.navigate).toHaveBeenCalledWith(['']);
  });

  /* ---------- TOKEN ---------- */

  it('should return false if token is expired', () => {
    service = TestBed.inject(AuthService);

    const expiredToken = btoa(JSON.stringify({ exp: Date.now() - 1000 }));
    localStorage.setItem('token', expiredToken);

    expect(service.isLoggedIn()).toBeFalse();
  });

  it('should return true if token is valid', () => {
    service = TestBed.inject(AuthService);

    const validToken = btoa(JSON.stringify({ exp: Date.now() + 100000 }));
    localStorage.setItem('token', validToken);

    expect(service.isLoggedIn()).toBeTrue();
  });

  /* ---------- USER ---------- */

  it('should return user from localStorage', () => {
    service = TestBed.inject(AuthService);

    const user = { username: 'john', fullName: 'John', email: 'john@test.com' };
    localStorage.setItem('user', JSON.stringify(user));

    expect(service.getUser()).toEqual(user as any);
  });

  it('should return null if no user stored', () => {
    service = TestBed.inject(AuthService);
    expect(service.getUser()).toBeNull();
  });

  /* ---------- BEHAVIOR SUBJECT ---------- */

  it('should emit login status changes', () => {
    service = TestBed.inject(AuthService);

    service.isLoggedIn$.pipe(take(1)).subscribe((value) => {
      expect(value).toBeFalse();
    });

    service.refreshLoginStatus();
  });
});
