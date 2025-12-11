import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../Services/dashboard.service';
import { Application } from '../../../Models/application.model';

@Component({
  selector: 'app-application-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.scss']
})
export class ApplicationListComponent implements OnInit {
  applications: Application[] = [];

  constructor(private dashService: DashboardService) {}

  ngOnInit() {
    this.applications = this.dashService.getAllApplications();
  }
}