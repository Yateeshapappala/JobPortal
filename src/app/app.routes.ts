import { Routes } from '@angular/router';
import { HomeComponent } from './Components/DashBoard/home/home.component';
import { DashboardShellComponent } from './Components/DashBoard/dashboard-shell/dashboard-shell.component';

export const routes: Routes = [
  // Redirect empty path to dashboard immediately so you see your work
  { path: '', component: HomeComponent },
  
  // The actual route for the dashboard
  { path: 'dashboard', component: DashboardShellComponent },
  { path: '**', redirectTo: '' }
  
  // Later, you will add Login and Home routes here
  // { path: 'login', component: LoginComponent },
];