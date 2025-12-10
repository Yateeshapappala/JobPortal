import { Routes } from '@angular/router';
import { JobListComponent } from './Components/job-list/job-list.component';
import { HomeComponent } from './Components/DashBoard/home/home.component';
import { DashboardShellComponent } from './Components/DashBoard/dashboard-shell/dashboard-shell.component';

export const routes: Routes = [
    { path: 'jobs', component: JobListComponent },
  { path: '', component: HomeComponent },
  { path: 'dashboard', component: DashboardShellComponent },
  { path: 'jobs', component: JobListComponent },
  {path: 'login', loadComponent: () => import('./Components/Auth/loginpage/loginpage.component').then(m => m.LoginpageComponent)},
  {path: 'register', loadComponent: () => import('./Components/Auth/registration-page/registration-page.component').then(m => m.RegistrationPageComponent)},
  { path: '**', redirectTo: '' },


];