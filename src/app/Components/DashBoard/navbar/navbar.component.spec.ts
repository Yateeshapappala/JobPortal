import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarComponent } from './navbar.component';
import { BehaviorSubject } from 'rxjs';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../Services/Auth.service';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  const isLoggedIn$ = new BehaviorSubject<boolean>(false);

  const authServiceMock = {
    isLoggedIn$: isLoggedIn$.asObservable(),
    isLoggedIn: jasmine.createSpy('isLoggedIn').and.returnValue(false),
    getUser: jasmine.createSpy('getUser').and.returnValue(null),
    logout: jasmine.createSpy('logout'),
  };
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideRouter([]), // ✅ PROVIDES Router + ActivatedRoute
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should show logged-out state by default', () => {
    expect(component.isLoggedIn).toBeFalse();
  });

  it('should update state when user logs in', () => {
    isLoggedIn$.next(true);
    fixture.detectChanges();

    expect(component.isLoggedIn).toBeTrue();
  });
});
