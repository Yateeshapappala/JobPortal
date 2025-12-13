import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../Services/auth.service';
import { JobsService } from '../../../Services/job.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  // Removed HomeScrollComponent from imports because template uses the inline featured scroll markup
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  jobs: any[] = [];
  filteredJobs: any[] = [];
  loading = false;
  searchTerm$ = new Subject<string>();
  private sub = new Subscription();
  searchQuery = '';

  /** Keep featured jobs as raw objects (any) so the template can show API fields directly */
  featuredJobs: any[] = [];

  /** scroller speed control (pixels per second) - you can tweak in template binding */
  scrollerPxPerSecond = 85;

  constructor(
    private auth: AuthService,
    private router: Router,
    private jobsService: JobsService
  ) {
    // debounce search
    this.sub.add(
      this.searchTerm$
        .pipe(debounceTime(250))
        .subscribe((q) => this.applyFilter(q))
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

    const s = this.jobsService.getJobs().subscribe({
      next: (res: any) => {
        const list = res?.jobs ?? (Array.isArray(res) ? res : []);
        this.jobs = list;
        this.filteredJobs = list;
        // Use the raw list as featured jobs (optionally pick top N or filter by some flag)
        this.featuredJobs = this.prepareFeaturedJobs(list);
        this.loading = false;
      },
      error: () => {
        this.jobs = [];
        this.filteredJobs = [];
        this.featuredJobs = [];
        this.loading = false;
      },
    });

    this.sub.add(s);
  }

  onSearchInput(q: string) {
    this.searchQuery = q;
    this.searchTerm$.next(q || '');
  }

  public applyFilter(q: string) {
    q = (q || '').trim().toLowerCase();
    if (!q) {
      this.filteredJobs = this.jobs;
      // also update featured jobs if you want them to reflect filter
      this.featuredJobs = this.prepareFeaturedJobs(this.jobs);
      return;
    }
    this.filteredJobs = this.jobs.filter((j) =>
      (
        (j.title || j.job_title || '') +
        ' ' +
        (j.company_name || j.company || '') +
        ' ' +
        (j.description || j.summary || '')
      )
        .toLowerCase()
        .includes(q)
    );
    // optionally restrict featured to filtered results
    this.featuredJobs = this.prepareFeaturedJobs(this.filteredJobs);
  }

  apply(job: any) {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/jobs/${job.id || job.slug || ''}` },
      });
      return;
    }
    this.router.navigate(['/jobs', job.id || job.slug]);
  }

  /**
   * Prepare featured jobs array. Keep raw job objects so template can access all fields.
   * Optionally pick top N, or only those with a 'featured' attribute.
   */
  // add to HomeComponent class (near featuredJobs etc.)
  companies = [
    { name: 'Google' },
    { name: 'Microsoft' },
    { name: 'Netflix' },
    { name: 'Amazon' },
    { name: 'Adobe' },
    { name: 'Salesforce' },
  ];

  // Optional: trackBy for companies
  trackByCompany(index: number, item: any) {
    return item?.name ?? index;
  }

  // optional error handler to fall back to placeholder
  onLogoError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/company-placeholder.svg';
    }
  }

  private prepareFeaturedJobs(raw: any[]): any[] {
    if (!Array.isArray(raw) || raw.length === 0) {
      return [];
    }

    // Example: pick top 10 jobs. Change logic if you want a 'featured' filter.
    const top = raw.slice(0, 10);

    // If too few items, duplicate until we have at least 6 for nicer horizontal scrolling UI:
    const minVisible = 6;
    if (top.length > 0 && top.length < minVisible) {
      const result: any[] = [];
      let idx = 0;
      while (result.length < minVisible) {
        result.push({ ...top[idx % top.length] });
        idx++;
      }
      return result;
    }
    return top;
  }

  trackByJob(index: number, item: any) {
    return item?.id ?? item?.slug ?? index;
  }
}
