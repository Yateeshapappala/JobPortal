import { Routes } from '@angular/router';
import { JobListComponent } from './jobs/job-list/job-list.component';

export const routes: Routes = [
<<<<<<< HEAD
    // {path : '', redirectTo: 'jobs', pathMatch: 'full' },
    { path: 'jobs', component: JobListComponent },
=======
   
    {path: 'login', loadComponent: () => import('./Components/Auth/loginpage/loginpage.component').then(m => m.LoginpageComponent)},
    {path: 'register', loadComponent: () => import('./Components/Auth/registration-page/registration-page.component').then(m => m.RegistrationPageComponent)},
>>>>>>> b45dfcfd46cfc8132ff4d8c11adfd8037a2e7104
];
