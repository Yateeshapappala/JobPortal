import { Injectable } from '@angular/core';
import { ApplicationStorageService } from './application-storage.service';
import { Application } from '../Models/application.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private storage: ApplicationStorageService) { }

  getAllApplications(): Application[] {
    return this.storage.getApplications();
  }

  // Logic to calculate stats for the top cards
  getStats() {
    const apps = this.getAllApplications();
    return {
      total: apps.length,
      selected: apps.filter(a => a.status === 'SELECTED').length,
      pending: apps.filter(a => a.status === 'IN-REVIEW').length,
      rejected: apps.filter(a => a.status === 'REJECTED').length
    };
  }
}