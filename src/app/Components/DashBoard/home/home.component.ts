import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../Services/Auth.service';
import { JobsService } from '../../../Services/job.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  jobs: any[] = [];
  filteredJobs: any[] = [];
  loading = false;
  searchTerm$ = new Subject<string>();
  private sub = new Subscription();
  searchQuery = '';

  constructor(private auth: AuthService, private router: Router, private jobsService: JobsService) {
    // debounce search
    this.sub.add(
      this.searchTerm$.pipe(debounceTime(250)).subscribe(q => this.applyFilter(q))
    );
  }

  ngOnInit() {
    this.loadJobs();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  loadJobs() {
    this.loading = true;
    this.jobsService.getJobs().subscribe({
      next: (res: any) => {
        const list = res?.jobs ?? (Array.isArray(res) ? res : []);
        this.jobs = list;
        this.filteredJobs = list;
        this.loading = false;
      },
      error: () => {
        this.jobs = [];
        this.filteredJobs = [];
        this.loading = false;
      }
    });
  }

  onSearchInput(q: string) {
    this.searchQuery = q;
    this.searchTerm$.next(q || '');
  }

  public applyFilter(q: string) {
    q = (q || '').trim().toLowerCase();
    if (!q) {
      this.filteredJobs = this.jobs;
      return;
    }
    this.filteredJobs = this.jobs.filter(j =>
      ((j.title || j.job_title) + ' ' + (j.company_name || j.company) + ' ' + (j.description || '')).toLowerCase().includes(q)
    );
  }

  apply(job: any) {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: `/jobs/${job.id || job.slug || ''}` }});
      return;
    }
    this.router.navigate(['/jobs', job.id || job.slug]);
  }
}
