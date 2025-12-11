import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Application } from '../Models/application.model';

@Injectable({
  providedIn: 'root'
})
export class ApplicationStorageService {
  private key = 'job_portal_applications';

  // BehaviorSubject to emit current applications and updates
  private appsSubject = new BehaviorSubject<Application[]>(this.loadRawApplications());
  apps$ = this.appsSubject.asObservable();

  constructor() {
    this.seedData();
    // ensure subject has normalized dates
    this.emitNormalized();
  }

  // load raw JSON from localStorage (no date parsing)
  private loadRawApplications(): Application[] {
    const data = localStorage.getItem(this.key);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private seedData() {
    const raw = localStorage.getItem(this.key);
    if (raw) {
      // normalize and re-save formats (dates)
      const parsed: any[] = JSON.parse(raw);
      const normalized = parsed.map(p => ({ ...p, dateApplied: this.parseDate(p.dateApplied) }));
      localStorage.setItem(this.key, JSON.stringify(normalized));
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const demoEmail1 = users && users[0] ? (users[0].email || '') : 'demo1@example.com';
    const demoEmail2 = users && users[1] ? (users[1].email || 'demo2@example.com') : 'demo2@example.com';

    const mockData: Application[] = [
      { id: '1', jobTitle: 'Senior Angular Dev', company: 'Google', status: 'IN-REVIEW', dateApplied: new Date('2025-08-20'), logoUrl: 'assets/google.png', userEmail: demoEmail1 },
      { id: '2', jobTitle: 'UI/UX Designer', company: 'Figma', status: 'SELECTED', dateApplied: new Date('2025-08-15'), logoUrl: 'assets/figma.png', userEmail: demoEmail2 },
      { id: '3', jobTitle: 'Backend Engineer', company: 'Netflix', status: 'REJECTED', dateApplied: new Date('2025-08-10'), logoUrl: 'assets/netflix.png', userEmail: demoEmail1 },
      { id: '4', jobTitle: 'Full Stack Dev', company: 'Amazon', status: 'REVIEWED', dateApplied: new Date('2025-09-01'), logoUrl: 'assets/amazon.png', userEmail: demoEmail2 },
    ];

    localStorage.setItem(this.key, JSON.stringify(mockData));
  }

  private parseDate(value: any): Date {
    if (!value) return new Date();
    if (value instanceof Date) return value;
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
  }

  // Normalize stored apps then emit via BehaviorSubject
  private emitNormalized() {
    const data = localStorage.getItem(this.key);
    if (!data) {
      this.appsSubject.next([]);
      return;
    }
    try {
      const parsed: any[] = JSON.parse(data);
      const normalized = parsed.map(p => ({ ...p, dateApplied: this.parseDate(p.dateApplied) }));
      this.appsSubject.next(normalized);
    } catch {
      this.appsSubject.next([]);
    }
  }

  // Public getter (returns Date objects)
  getApplications(): Application[] {
    return this.appsSubject.getValue();
  }

  // Save a new application and emit update
  saveApplication(app: Partial<Application>, userEmail?: string): Application {
    const all = this.getApplications().slice(); // clone
    const nextId = (all.length ? Math.max(...all.map(a => +a.id)) + 1 : 1).toString();

    if (!userEmail) {
      const userRaw = localStorage.getItem('user');
      if (userRaw) {
        try {
          const u = JSON.parse(userRaw);
          userEmail = u.email || u.username || '';
        } catch {
          userEmail = '';
        }
      }
    }

    const newApp: Application = {
      id: nextId,
      jobTitle: app.jobTitle || 'Unknown Role',
      company: app.company || 'Unknown Company',
      status: app.status || 'IN-REVIEW',
      dateApplied: app.dateApplied ? this.parseDate(app.dateApplied) : new Date(),
      logoUrl: app.logoUrl,
      userEmail: userEmail || undefined
    };

    all.unshift(newApp);
    // persist (serialize Dates to ISO)
    localStorage.setItem(this.key, JSON.stringify(all));
    // emit normalized (dates will be parsed on subscribers)
    this.emitNormalized();
    return newApp;
  }

  // Remove and emit
  removeApplication(id: string) {
    const filtered = this.getApplications().filter(a => a.id !== id);
    localStorage.setItem(this.key, JSON.stringify(filtered));
    this.emitNormalized();
  }

  // Utility: replace all (rare)
  setAllApplications(apps: Application[]) {
    localStorage.setItem(this.key, JSON.stringify(apps));
    this.emitNormalized();
  }
}
