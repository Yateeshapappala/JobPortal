import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { JobsService } from '../../Services/job.service';
import  { Location } from '@angular/common';
import { ApplyModalComponent } from '../apply-modal/apply-modal.component';

@Component({
  selector: 'app-job-details',
  standalone: true,
  // Note: Ensure ApplyModalComponent is imported here
  imports: [CommonModule, ApplyModalComponent], 
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.scss']
})
export class JobDetailsComponent implements OnInit {
  private location = inject(Location);
  private route = inject(ActivatedRoute);
  private jobService = inject(JobsService);

  // Property used to control the button text/style
  isJobApplied: boolean = false; 

  showApply = false;
  hover = false;
  jobId!: string;
  jobDetails: any;

  ngOnInit(): void {
    this.jobId = this.route.snapshot.params['id'];

    // Fetch job by ID from API or local storage
    this.jobService.getJobById(this.jobId).subscribe((res: any) => {
      this.jobDetails = res;
      
      // CRITICAL: Check status once job details are loaded
      this.checkApplicationStatus(); 
    });
  }
  
  // --- CORE STATUS CHECK FUNCTION ---
  checkApplicationStatus(): void {
    // We only need to check if the jobDetails is ready and has an ID
    if (!this.jobDetails || !this.jobDetails.id) {
        return;
    }
    
    const appliedJobsKey = 'appliedJobIds';
    // Access Local Storage directly (since we decided against a service)
    const existingAppliedIds: (string | number)[] = JSON.parse(localStorage.getItem(appliedJobsKey) || '[]');
    
    // Check if the current jobId exists in the list of applied IDs
    this.isJobApplied = existingAppliedIds.some(id => String(id) === String(this.jobDetails.id));
    
    console.log(`Job ID ${this.jobDetails.id} checked. Applied status: ${this.isJobApplied}`);
  }

  // --- EVENT HANDLER FROM MODAL ---
  onModalHidden() {
    // This method runs immediately after the modal closes, 
    // ensuring the button status updates instantly.
    console.log("Event received from modal: Rechecking application status...");
    this.checkApplicationStatus();
  }

  // ... (Other helper methods) ...
  
  openApplyModal() {
    this.showApply = true;
  }
  
  goBack() {
    this.location.back(); // goes back to previous page
  }
}