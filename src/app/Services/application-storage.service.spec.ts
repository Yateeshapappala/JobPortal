import { TestBed } from '@angular/core/testing';
import { ApplicationStorageService } from './application-storage.service';
import { Application } from '../Models/application.model';

describe('ApplicationStorageService', () => {
  let service: ApplicationStorageService;
  const STORAGE_KEY = 'job_portal_applications';

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApplicationStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  /* ---------------- INIT / LOAD ---------------- */

  it('should load applications from localStorage and normalize dates', () => {
    const rawApps = [
      {
        id: '1',
        jobTitle: 'Angular Dev',
        company: 'Google',
        status: 'IN-REVIEW',
        dateApplied: '2024-01-01T00:00:00.000Z',
      },
    ];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(rawApps));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});

    const freshService = TestBed.inject(ApplicationStorageService);

    const apps = freshService.getApplications();

    expect(apps.length).toBe(1);
    expect(apps[0].dateApplied instanceof Date).toBeTrue();
  });

  it('should return empty array if storage is empty', () => {
    expect(service.getApplications()).toEqual([]);
  });

  /* ---------------- SAVE APPLICATION ---------------- */

  it('should save a new application and emit update', () => {
    const app = service.saveApplication(
      {
        jobTitle: 'Frontend Dev',
        company: 'Amazon',
      },
      'user@test.com'
    );

    const apps = service.getApplications();

    expect(app).toBeTruthy();
    expect(apps.length).toBe(1);
    expect(apps[0].jobTitle).toBe('Frontend Dev');
    expect(apps[0].userEmail).toBe('user@test.com');
    expect(apps[0].dateApplied instanceof Date).toBeTrue();
  });

  it('should auto-generate id if no numeric id exists', () => {
    const app = service.saveApplication({
      jobTitle: 'Backend Dev',
    });

    expect(app.id).toBeTruthy();
  });

  /* ---------------- OBSERVABLE ---------------- */

  it('should emit applications via apps$', (done) => {
    service.apps$.subscribe((apps) => {
      if (apps.length === 0) return; // ignore initial

      expect(apps.length).toBe(1);
      expect(apps[0].jobTitle).toBe('QA Engineer');
      done();
    });

    service.saveApplication({
      jobTitle: 'QA Engineer',
    });
  });

  /* ---------------- REMOVE ---------------- */

  it('should remove application by id', () => {
    const app1 = service.saveApplication({ jobTitle: 'Dev 1' });
    const app2 = service.saveApplication({ jobTitle: 'Dev 2' });

    service.removeApplication(app1.id);

    const apps = service.getApplications();

    expect(apps.length).toBe(1);
    expect(apps[0].id).toBe(app2.id);
  });

  /* ---------------- SET ALL ---------------- */

  it('should replace all applications using setAllApplications()', () => {
    const apps: Application[] = [
      {
        id: '10',
        jobTitle: 'Designer',
        company: 'Adobe',
        status: 'SELECTED',
        dateApplied: new Date(),
      } as Application,
    ];

    service.setAllApplications(apps);

    const stored = service.getApplications();

    expect(stored.length).toBe(1);
    expect(stored[0].jobTitle).toBe('Designer');
  });
});
