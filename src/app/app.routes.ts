import { Routes } from '@angular/router';
import { HomeComponent } from './Components/DashBoard/home/home.component';
import { DashboardShellComponent } from './Components/DashBoard/dashboard-shell/dashboard-shell.component';
import { JobListComponent } from './Components/job-list/job-list.component';

export const routes: Routes = [
  // Redirect empty path to dashboard immediately so you see your work
  { path: '', component: HomeComponent },
  { path: 'dashboard', component: DashboardShellComponent },
  { path: 'jobs', component: JobListComponent },
  {path: 'login', loadComponent: () => import('./Components/Auth/loginpage/loginpage.component').then(m => m.LoginpageComponent)},
  {path: 'register', loadComponent: () => import('./Components/Auth/registration-page/registration-page.component').then(m => m.RegistrationPageComponent)},
  { path: '**', redirectTo: '' },


];