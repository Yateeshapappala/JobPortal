import { TestBed } from '@angular/core/testing';
import { DashboardService } from './dashboard.service';
import { ApplicationStorageService } from './application-storage.service';
import { AuthService } from './auth.service';
import { BehaviorSubject } from 'rxjs';

describe('DashboardService', () => {
  let service: DashboardService;

  const mockUser = {
    username: 'john',
    email: 'john@test.com',
  };

  const mockApps = [
    { id: 1, userEmail: 'john@test.com', status: 'SELECTED' },
    { id: 2, applicantEmail: 'john@test.com', status: 'IN-REVIEW' },
    { id: 3, username: 'john', status: 'REJECTED' },
    { id: 4, userEmail: 'other@test.com', status: 'SELECTED' },
  ];

  const appsSubject = new BehaviorSubject<any[]>([]);

  const storageMock = {
    apps$: appsSubject.asObservable(),
    getApplications: jasmine.createSpy().and.returnValue(mockApps),
  };

  const authMock = {
    getUser: jasmine.createSpy().and.returnValue(mockUser),
  };

  beforeEach(() => {
    authMock.getUser.and.returnValue({
      username: 'john',
      email: 'john@test.com',
    });
    TestBed.configureTestingModule({
      providers: [
        DashboardService,
        { provide: ApplicationStorageService, useValue: storageMock },
        { provide: AuthService, useValue: authMock },
      ],
    });

    service = TestBed.inject(DashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return all applications', () => {
    const apps = service.getAllApplications();
    expect(apps.length).toBe(4);
  });

  it('should return user applications (sync)', () => {
    const apps = service.getUserApplications();
    expect(apps.length).toBe(3);
  });

  it('should emit user-specific applications from observable', (done) => {
    service.getUserApplications$().subscribe((apps) => {
      if (apps.length === 0) return; // ignore initial empty emission

      expect(apps.length).toBe(3);
      done();
    });

    // 🔥 emit AFTER subscription
    appsSubject.next(mockApps);
  });

  it('should return empty array if user is null', () => {
    authMock.getUser.and.returnValue(null);

    const apps = service.getUserApplications();
    expect(apps).toEqual([]);
  });

  it('should calculate correct dashboard stats', () => {
    const stats = service.getStats();

    expect(stats.total).toBe(3);
    expect(stats.selected).toBe(1);
    expect(stats.pending).toBe(1);
    expect(stats.rejected).toBe(1);
  });
});
