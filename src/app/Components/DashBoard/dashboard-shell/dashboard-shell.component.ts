import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardStatsComponent } from '../dashboard-stats/dashboard-stats.component';
import { ApplicationListComponent } from '../application-list/application-list.component';

@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [CommonModule, DashboardStatsComponent, ApplicationListComponent],
  templateUrl: './dashboard-shell.component.html',
  styleUrls: ['./dashboard-shell.component.scss']
})
export class DashboardShellComponent {}