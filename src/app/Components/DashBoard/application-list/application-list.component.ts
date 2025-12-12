import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ApplicationStorageService } from '../../../Services/application-storage.service';
import { AuthService } from '../../../Services/Auth.service';
import { Application } from '../../../Models/application.model';

@Component({
  selector: 'app-application-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.scss'],
})
export class ApplicationListComponent implements OnInit, OnDestroy {
  applications: Application[] = [];
  selectedApp: Application | null = null;
  showViewModal = false;
  private sub = new Subscription();

  constructor(
    private storage: ApplicationStorageService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    // Subscribe to the central apps$ stream and filter to current user
    this.sub.add(
      this.storage.apps$.subscribe((all) => {
        const user = this.auth.getUser();
        const userEmail = user?.email || user?.username || undefined;
        if (userEmail) {
          this.applications = (all || []).filter(
            (a) => (a.userEmail || '').toLowerCase() === userEmail.toLowerCase()
          );
        } else {
          // If not logged in, show nothing
          this.applications = [];
        }

        // sort newest-first
        this.applications.sort((a, b) => {
          const da =
            a.dateApplied instanceof Date
              ? a.dateApplied.getTime()
              : new Date(a.dateApplied).getTime();
          const db =
            b.dateApplied instanceof Date
              ? b.dateApplied.getTime()
              : new Date(b.dateApplied).getTime();
          return db - da;
        });
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
    const ok = confirm(
      'Withdraw this application? This action cannot be undone.'
    );
    if (!ok) return;
    this.storage.removeApplication(app.id);
    alert('Application withdrawn.');
  }
}
