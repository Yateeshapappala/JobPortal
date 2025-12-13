import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { JobsService } from '../../../Services/job.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.scss'],
})
export class JobListComponent implements OnInit {
  jobs: any[] = [];
  filteredJobs: any[] = [];
  bookmarkedJobs: number[] = [];

  page = 1;
  pageSize = 10;
  searchText = "";
  showBookmarksOnly = false;
  viewMode: 'card' | 'list' = 'card';

  constructor(private jobsService: JobsService) {}

  setView(mode: 'card' | 'list') {
    this.viewMode = mode;
  }

  ngOnInit(): void {
    this.jobsService.getJobs().subscribe((res: any) => {
      this.jobs = res.jobs;
      this.filteredJobs = [...this.jobs];
    });
  }

  /* ---------------------- SEARCH FILTER ---------------------- */
  filterJobs() {
  this.page = 1;
  const search = this.searchText.toLowerCase();

  this.filteredJobs = this.jobs.filter(job =>
    job.title.toLowerCase().includes(search) ||
    job.company_name.toLowerCase().includes(search)
  );

  if (this.showBookmarksOnly) {
    this.filteredJobs = this.filteredJobs.filter(job =>
      this.bookmarkedJobs.includes(job.id)
    );
  }
}

toggleBookmark(jobId: number) {
  if (this.bookmarkedJobs.includes(jobId)) {
    this.bookmarkedJobs = this.bookmarkedJobs.filter(id => id !== jobId);
  } else {
    this.bookmarkedJobs.push(jobId);
  }

  if (this.showBookmarksOnly) {
    this.filterJobs();
  }
}

toggleBookmarkFilter() {
  this.showBookmarksOnly = !this.showBookmarksOnly;
  this.filterJobs();
}

isBookmarked(jobId: number): boolean {
  return this.bookmarkedJobs.includes(jobId);
}

  /* ---------------------- PAGINATION ---------------------- */
  get paginatedJobs() {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredJobs.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filteredJobs.length / this.pageSize);
  }

  get totalPagesArray() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  nextPage() {
    if (this.page < this.totalPages) this.page++;
  }

  prevPage() {
    if (this.page > 1) this.page--;
  }

  goToPage(p: number) {
    this.page = p;
  }
  clearSearch(): void {
    // 1. Clear the bound model
    this.searchText = '';
    
    // 2. Re-run the filter to display all jobs
    this.filterJobs(); 
  }
}
