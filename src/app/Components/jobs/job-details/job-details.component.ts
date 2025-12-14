import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location, TitleCasePipe, DatePipe } from '@angular/common';
import { JobsService } from '../../../Services/job.service';
import { catchError } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { ApplyModalComponent } from '../apply-modal/apply-modal.component';
import { ToastrService } from 'ngx-toastr';
import { NgIf, NgFor, NgStyle } from '@angular/common';

// Assuming your Job interface looks something like this (adjust as needed)
interface Job {
    id: number | string;
    title: string;
    company_name: string;
    description: string;
    candidate_required_location: string;
    job_type: string;
    salary: string;
    tags: string[];
    publication_date: string;
}

@Component({
    selector: 'app-job-details',
    templateUrl: './job-details.component.html',
    styleUrls: ['./job-details.component.scss'],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgStyle,
        TitleCasePipe,
        DatePipe,
        ApplyModalComponent // Import the modal component
    ]
})
export class JobDetailsComponent implements OnInit {
    jobDetails: Job | undefined;
    jobId: string | undefined;
    isJobApplied: boolean = false;
    showApply: boolean = false; // State to manage modal visibility (if using a non-Bootstrap modal)

    private appliedJobsKey = 'appliedJobIds';

    constructor(
        private route: ActivatedRoute,
        private jobService: JobsService,
        private location: Location,
        private toastr: ToastrService
    ) {}

    ngOnInit(): void {
        const id = this.route.snapshot.params['id'];
        this.jobId = id;
        
        // 1. Check applied status immediately upon load
        this.checkAppliedStatus();

        // 2. Fetch job details with error handling
        this.jobService.getJobById(id).pipe(
            catchError(error => {
                console.error('Failed to load job details:', error);
                this.jobDetails = undefined; // Set to undefined on API failure
                this.toastr.error('Could not load job details.', 'Error');
                return of(null); // Return a clean observable to complete the stream
            })
        )
        .subscribe(job => {
            if (job) {
                this.jobDetails = job;
            }
        });
    }

    /**
     * Checks local storage to see if the current job ID has been applied to.
     * This method handles the string-to-number conversion for robust comparison.
     */
    private checkAppliedStatus(): void {
        if (!this.jobId) {
            this.isJobApplied = false;
            return;
        }

        const appliedJobsJson = localStorage.getItem(this.appliedJobsKey);
        
        if (appliedJobsJson) {
            try {
                const appliedIds: number[] = JSON.parse(appliedJobsJson);
                
                // CRITICAL FIX: Convert string ID from route to number for comparison
                const numericId = parseInt(this.jobId, 10); 
                
                this.isJobApplied = appliedIds.includes(numericId);
                
            } catch (e) {
                console.error('Error parsing applied job IDs from local storage', e);
                this.isJobApplied = false;
            }
        } else {
            this.isJobApplied = false;
        }
    }

    /**
     * Called when the apply modal is hidden (assuming successful application saved to storage).
     * Re-runs the check to update the 'Applied' button status.
     */
    onModalHidden(): void {
        this.checkAppliedStatus();
    }

    goBack(): void {
        this.location.back();
    }
}