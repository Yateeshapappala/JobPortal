// dashboard-shell.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardStatsComponent } from '../dashboard-stats/dashboard-stats.component';
import { ApplicationListComponent } from '../application-list/application-list.component';
import { JobsService } from '../../../Services/job.service';
import { AuthService } from '../../../Services/Auth.service';
import { RouterModule, Router } from '@angular/router';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [CommonModule, DashboardStatsComponent, ApplicationListComponent, RouterModule],
  templateUrl: './dashboard-shell.component.html',
  styleUrls: ['./dashboard-shell.component.scss']
})
export class DashboardShellComponent implements OnInit {
  recentJobs: any[] = [];
  loadingJobs = false;

  constructor(private jobsService: JobsService, private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadRecentJobs();
  }

  loadRecentJobs() {
    this.loadingJobs = true;
    this.jobsService.getJobs()
      .pipe(
        map((res: any) => {
          // Remotive API returns { jobs: [...] }
          if (res && res.jobs) return res.jobs.slice(0, 6);
          // fallback if raw array
          if (Array.isArray(res)) return res.slice(0, 6);
          return [];
        }),
        catchError(err => {
          console.error('Failed to load recent jobs', err);
          return of([]);
        })
      )
      .subscribe((jobs: any[]) => {
        this.recentJobs = jobs;
        this.loadingJobs = false;
      });
  }

  applyFromRecent(job: any) {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: `/jobs/${job.id || job.slug || ''}` }});
      return;
    }
    // If logged in, navigate to job details or open application modal
    this.router.navigate(['/jobs', job.id || job.slug]);
  }
}
