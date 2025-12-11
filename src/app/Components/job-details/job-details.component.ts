import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { JobsService } from '../../Services/job.service';
import  { Location } from '@angular/common';
import { ApplyModalComponent } from '../apply-modal/apply-modal.component';

@Component({
  selector: 'app-job-details',
  standalone: true,
  imports: [CommonModule,ApplyModalComponent],
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.scss']
})
export class JobDetailsComponent implements OnInit {
private location = inject(Location);
  private route = inject(ActivatedRoute);
  private jobService = inject(JobsService);

  showApply = false;
  hover = false;
  jobId!: string;
  jobDetails: any;

  ngOnInit(): void {
    this.jobId = this.route.snapshot.params['id'];

    // Fetch job by ID from API or local storage
    this.jobService.getJobById(this.jobId).subscribe((res: any) => {
      this.jobDetails = res;
    });
  }

  openApplyModal() {
    this.showApply = true;
  }
  goBack() {
    this.location.back(); // goes back to previous page
  }
}
