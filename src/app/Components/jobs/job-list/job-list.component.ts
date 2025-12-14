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
  isLoading = false; 

  page = 1;
  pageSize = 10;
  searchText = "";
  showBookmarksOnly = false;
  viewMode: 'card' | 'list' = 'card';

  private readonly BOOKMARKS_KEY = 'jobPortalBookmarks';

  constructor(private jobsService: JobsService) {}

  setView(mode: 'card' | 'list') {
    this.viewMode = mode;
  }

  ngOnInit(): void {
    this.loadBookmarks(); 
    
    this.isLoading = true; 
    this.jobsService.getJobs().subscribe({
      next: (res: any) => {
        this.jobs = res.jobs;
        this.filteredJobs = [...this.jobs];
        
        this.isLoading = false; 
        
        this.filterJobs(); 
      },
      error: (err: any) => {
        console.error('Failed to load jobs', err);
        this.isLoading = false; 
      }
    });
  }

  /* ---------------------- LOCAL STORAGE MANAGEMENT ---------------------- */
    
  private loadBookmarks(): void {
    try {
      const storedBookmarks = localStorage.getItem(this.BOOKMARKS_KEY);
      if (storedBookmarks) {
        this.bookmarkedJobs = JSON.parse(storedBookmarks) as number[];
      }
    } catch (e) {
      console.error('Error loading bookmarks from localStorage', e);
      this.bookmarkedJobs = [];
    }
  }

  private saveBookmarks(): void {
    try {
      localStorage.setItem(this.BOOKMARKS_KEY, JSON.stringify(this.bookmarkedJobs));
    } catch (e) {
      console.error('Error saving bookmarks to localStorage', e);
    }
  }


  /* ---------------------- SEARCH AND BOOKMARKS ---------------------- */
  filterJobs() {
    this.page = 1;
    const search = this.searchText.toLowerCase();

    let results = this.jobs.filter(job =>
        job.title.toLowerCase().includes(search) ||
        job.company_name.toLowerCase().includes(search)
    );

    if (this.showBookmarksOnly) {
        results = results.filter(job =>
            this.bookmarkedJobs.includes(job.id)
        );
    }
    
    this.filteredJobs = results;
  }
  
  toggleBookmark(jobId: number) {
    if (this.bookmarkedJobs.includes(jobId)) {
        this.bookmarkedJobs = this.bookmarkedJobs.filter(id => id !== jobId);
    } else {
        this.bookmarkedJobs.push(jobId);
    }

    this.saveBookmarks(); 

    if (this.showBookmarksOnly) {
        this.filterJobs();
    }
  }

  toggleBookmarkFilter(state?: boolean) {
    if (typeof state === 'boolean') {
        this.showBookmarksOnly = state;
    } else {
        this.showBookmarksOnly = !this.showBookmarksOnly;
    }
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
    this.searchText = '';
    this.filterJobs(); 
  }
}