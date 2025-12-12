import { Routes } from '@angular/router';
import { JobListComponent } from './Components/job-list/job-list.component';
import { HomeComponent } from './Components/DashBoard/home/home.component';
import { DashboardShellComponent } from './Components/DashBoard/dashboard-shell/dashboard-shell.component';
import { authGuard } from './Guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'dashboard', component: DashboardShellComponent ,canActivate:[authGuard]},
  {path: 'login', loadComponent: () => import('./Components/Auth/loginpage/loginpage.component').then(m => m.LoginpageComponent)},
  {path: 'register', loadComponent: () => import('./Components/Auth/registration-page/registration-page.component').then(m => m.RegistrationPageComponent)},
  {path:'profile', loadComponent: () => import('./Components/Profile/profile.component').then(m => m.ProfileComponent), canActivate:[authGuard]},
  { path: 'jobs', component: JobListComponent },
   {path:'jobs/:id', loadComponent: () => import('./Components/job-details/job-details.component').then(m => m.JobDetailsComponent),canActivate:[authGuard]},


  { path: '**', redirectTo: '' },
];