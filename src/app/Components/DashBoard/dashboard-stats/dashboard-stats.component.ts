import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../Services/dashboard.service';
@Component({
  selector: 'app-dashboard-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-stats.component.html',
  styleUrls: ['./dashboard-stats.component.scss']
})
export class DashboardStatsComponent implements OnInit {
  stats: any = { total: 0, selected: 0, pending: 0, rejected: 0 };

  constructor(private dashService: DashboardService) {}

  ngOnInit() {
    this.stats = this.dashService.getStats();
  }
}