import { Injectable } from '@angular/core';
import { Application } from '../Models/application.model';

@Injectable({
  providedIn: 'root'
})
export class ApplicationStorageService {
  private key = 'job_portal_applications';

  constructor() {
    this.seedData();
  }

  private seedData() {
    if (!localStorage.getItem(this.key)) {
      const mockData: Application[] = [
        { id: '1', jobTitle: 'Senior Angular Dev', company: 'Google', status: 'IN-REVIEW', dateApplied: new Date('2025-08-20'), logoUrl: 'assets/google.png' },
        { id: '2', jobTitle: 'UI/UX Designer', company: 'Figma', status: 'SELECTED', dateApplied: new Date('2025-08-15'), logoUrl: 'assets/figma.png' },
        { id: '3', jobTitle: 'Backend Engineer', company: 'Netflix', status: 'REJECTED', dateApplied: new Date('2025-08-10'), logoUrl: 'assets/netflix.png' },
        { id: '4', jobTitle: 'Full Stack Dev', company: 'Amazon', status: 'REVIEWED', dateApplied: new Date('2025-09-01'), logoUrl: 'assets/amazon.png' },
      ];
      localStorage.setItem(this.key, JSON.stringify(mockData));
    }
  }

  getApplications(): Application[] {
    const data = localStorage.getItem(this.key);
    return data ? JSON.parse(data) : [];
  }
}