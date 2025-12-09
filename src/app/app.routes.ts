import { Routes } from '@angular/router';
import { JobListComponent } from './jobs/job-list/job-list.component';

export const routes: Routes = [
    // {path : '', redirectTo: 'jobs', pathMatch: 'full' },
    { path: 'jobs', component: JobListComponent },
];
