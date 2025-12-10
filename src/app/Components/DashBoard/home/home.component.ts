import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  
  // Dummy data for the "Featured Jobs" section
  featuredJobs = [
    { title: 'Senior UX Designer', company: 'Google', type: 'Full Time', location: 'Remote', logo: 'G' },
    { title: 'Angular Developer', company: 'Netflix', type: 'Contract', location: 'Bangalore', logo: 'N' },
    { title: 'Product Manager', company: 'Spotify', type: 'Full Time', location: 'Mumbai', logo: 'S' },
    { title: 'Backend Engineer', company: 'Amazon', type: 'Part Time', location: 'Hyderabad', logo: 'A' }
  ];

}