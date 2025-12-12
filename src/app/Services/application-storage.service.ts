import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Application } from '../Models/application.model';

@Injectable({
  providedIn: 'root',
})
export class ApplicationStorageService {
  private key = 'job_portal_applications';

  // BehaviorSubject to emit current applications and updates
  private appsSubject = new BehaviorSubject<Application[]>(
    this.loadRawApplicationsNormalized()
  );
  apps$ = this.appsSubject.asObservable();

  constructor() {
    // ensure subject has normalized dates (already done by loadRawApplicationsNormalized)
  }

  // Load + normalize on init
  private loadRawApplicationsNormalized(): Application[] {
    const data = localStorage.getItem(this.key);
    if (!data) return [];
    try {
      const parsed: any[] = JSON.parse(data);
      // Normalize dateApplied to Date objects
      const normalized = parsed.map((p) => ({
        ...p,
        dateApplied: this.parseDate(p.dateApplied),
      }));
      // Persist normalized dates as ISO strings so storage is stable
      const serializable = normalized.map((a) => ({
        ...a,
        dateApplied:
          a.dateApplied instanceof Date
            ? a.dateApplied.toISOString()
            : a.dateApplied,
      }));
      localStorage.setItem(this.key, JSON.stringify(serializable));
      // Return objects with Date instances for consumers
      return normalized as Application[];
    } catch (e) {
      console.warn('Failed parsing applications from storage', e);
      return [];
    }
  }

  private parseDate(value: any): Date {
    if (!value) return new Date();
    if (value instanceof Date) return value;
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
  }

  // Public getter (returns Date objects)
  getApplications(): Application[] {
    return this.appsSubject.getValue();
  }

  // Save a new application and emit update
  saveApplication(app: Partial<Application>, userEmail?: string): Application {
    const all = this.getApplications().slice(); // clone

    // determine next numeric ID if possible, else fallback to timestamp
    const numericIds = all.map((a) => +a.id).filter((n) => !isNaN(n));
    const nextId = (
      numericIds.length ? Math.max(...numericIds) + 1 : Date.now()
    ).toString();

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
      status: (app.status as any) || 'IN-REVIEW',
      dateApplied: app.dateApplied
        ? this.parseDate(app.dateApplied)
        : new Date(),
      logoUrl: app.logoUrl,
      userEmail: userEmail || undefined,
      // preserve other fields for details (TS cast)
      ...(app as any),
    } as Application;

    // Put newest first
    all.unshift(newApp);

    // persist: convert Dates to ISO strings for JSON
    const serializable = all.map((a) => ({
      ...a,
      dateApplied:
        a.dateApplied instanceof Date
          ? a.dateApplied.toISOString()
          : a.dateApplied,
    }));
    localStorage.setItem(this.key, JSON.stringify(serializable));

    // emit normalized (dates will be parsed on subscribers)
    const normalized = serializable.map((p) => ({
      ...p,
      dateApplied: this.parseDate(p.dateApplied),
    })) as Application[];
    this.appsSubject.next(normalized);

    return newApp;
  }

  // Remove and emit
  removeApplication(id: string) {
    const filtered = this.getApplications().filter((a) => a.id !== id);
    const serializable = filtered.map((a) => ({
      ...a,
      dateApplied:
        a.dateApplied instanceof Date
          ? a.dateApplied.toISOString()
          : a.dateApplied,
    }));
    localStorage.setItem(this.key, JSON.stringify(serializable));
    this.appsSubject.next(filtered);
  }

  // Utility: replace all (rare)
  setAllApplications(apps: Application[]) {
    const serializable = apps.map((a) => ({
      ...a,
      dateApplied:
        a.dateApplied instanceof Date
          ? a.dateApplied.toISOString()
          : a.dateApplied,
    }));
    localStorage.setItem(this.key, JSON.stringify(serializable));
    // emit normalized
    const normalized = serializable.map((p) => ({
      ...p,
      dateApplied: this.parseDate(p.dateApplied),
    })) as Application[];
    this.appsSubject.next(normalized);
  }
}
