import { Injectable } from '@angular/core';
import { ApplicationStorageService } from './application-storage.service';
import { Application } from '../Models/application.model';
import { AuthService } from './Auth.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  // Observable of all apps from storage
  constructor(
    private storage: ApplicationStorageService,
    private auth: AuthService
  ) {}

  getAllApplications(): Application[] {
    return this.storage.getApplications();
  }

  // Observable: user-specific applications (updates live)
  getUserApplications$(): Observable<Application[]> {
    return this.storage.apps$.pipe(
      map((all) => {
        const user = this.auth.getUser();
        if (!user) return [];
        const email = (user as any).email?.toLowerCase();
        const username = (user as any).username?.toLowerCase();

        const filtered = all.filter((app: any) => {
          if (!app) return false;
          if (app.userEmail && email)
            return ('' + app.userEmail).toLowerCase() === email;
          if (app.applicantEmail && email)
            return ('' + app.applicantEmail).toLowerCase() === email;
          if (app.user && username)
            return ('' + app.user).toLowerCase() === username;
          if (app.username && username)
            return ('' + app.username).toLowerCase() === username;
          return false;
        });
        return filtered;
      })
    );
  }

  // synchronous helper used by non-reactive parts
  getUserApplications(): Application[] {
    const all = this.getAllApplications();
    const user = this.auth.getUser();
    if (!user) return [];
    const email = (user as any).email?.toLowerCase();
    const username = (user as any).username?.toLowerCase();
    const filtered = all.filter((app: any) => {
      if (app.userEmail && email)
        return ('' + app.userEmail).toLowerCase() === email;
      if (app.applicantEmail && email)
        return ('' + app.applicantEmail).toLowerCase() === email;
      if (app.user && username)
        return ('' + app.user).toLowerCase() === username;
      if (app.username && username)
        return ('' + app.username).toLowerCase() === username;
      return false;
    });
    return filtered;
  }

  getStats() {
    const apps = this.getUserApplications();
    return {
      total: apps.length,
      selected: apps.filter((a) => a.status === 'SELECTED').length,
      pending: apps.filter(
        (a) => a.status === 'IN-REVIEW' || a.status === 'REVIEWED'
      ).length,
      rejected: apps.filter((a) => a.status === 'REJECTED').length,
    };
  }
}
