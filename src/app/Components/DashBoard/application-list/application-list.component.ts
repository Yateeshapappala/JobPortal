import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../Services/dashboard.service';
import { Application } from '../../../Models/application.model';
import { ApplicationStorageService } from '../../../Services/application-storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-application-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.scss']
})
export class ApplicationListComponent implements OnInit, OnDestroy {
  applications: Application[] = [];
  selectedApp: Application | null = null;
  showViewModal = false;
  private sub = new Subscription();

  constructor(private dashService: DashboardService, private storage: ApplicationStorageService) {}

  ngOnInit() {
    // subscribe to live user-specific applications
    this.sub.add(
      this.dashService.getUserApplications$().subscribe(list => {
        this.applications = list;
      })
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  viewApplication(app: Application) {
    this.selectedApp = app;
    this.showViewModal = true;
  }

  closeView() {
    this.selectedApp = null;
    this.showViewModal = false;
  }

  confirmWithdraw(app: Application) {
    const ok = confirm('Withdraw this application? This action cannot be undone.');
    if (!ok) return;
    this.storage.removeApplication(app.id);
    // no manual reload required — subscription will update applications automatically
    alert('Application withdrawn.');
  }
}
