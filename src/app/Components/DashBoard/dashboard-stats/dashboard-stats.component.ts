import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ApplicationStorageService } from '../../../Services/application-storage.service';
import { AuthService } from '../../../Services/auth.service';

@Component({
  selector: 'app-dashboard-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-stats.component.html',
  styleUrls: ['./dashboard-stats.component.scss'],
})
export class DashboardStatsComponent implements OnInit, OnDestroy {
  stats: any = { total: 0, selected: 0, pending: 0, rejected: 0 };
  private sub = new Subscription();

  constructor(
    private storage: ApplicationStorageService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.sub.add(
      this.storage.apps$.subscribe((all) => {
        const user = this.auth.getUser();
        const userEmail = user?.email || user?.username || undefined;
        const userApps = userEmail
          ? (all || []).filter(
              (a) =>
                (a.userEmail || '').toLowerCase() === userEmail.toLowerCase()
            )
          : [];

        this.stats.total = userApps.length;
        this.stats.selected = userApps.filter(
          (a) => a.status === 'SELECTED'
        ).length;
        this.stats.pending = userApps.filter(
          (a) => a.status === 'IN-REVIEW' || a.status === 'REVIEWED'
        ).length;
        this.stats.rejected = userApps.filter(
          (a) => a.status === 'REJECTED'
        ).length;
      })
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
