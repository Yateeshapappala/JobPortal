import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../Services/auth.service';

describe('authGuard', () => {
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let routerMock: jasmine.SpyObj<Router>;

  const executeGuard: CanActivateFn = (...params) =>
    TestBed.runInInjectionContext(() => authGuard(...params));

  beforeEach(() => {
    authServiceMock = jasmine.createSpyObj<AuthService>('AuthService', [
      'isLoggedIn',
    ]);

    routerMock = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  /* ---------- TESTS ---------- */

  it('should allow navigation if user is logged in', () => {
    authServiceMock.isLoggedIn.and.returnValue(true);

    const result = executeGuard(
      {} as any,
      { url: '/dashboard' } as any
    );

    expect(result).toBeTrue();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login if user is not logged in', () => {
    authServiceMock.isLoggedIn.and.returnValue(false);

    const result = executeGuard(
      {} as any,
      { url: '/profile' } as any
    );

    expect(result).toBeFalse();
    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['/login'],
      { queryParams: { returnUrl: '/profile' } }
    );
  });
});
