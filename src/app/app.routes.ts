import { Routes } from '@angular/router';

export const routes: Routes = [
    {path: '', redirectTo: 'login', pathMatch: 'full'},
    {path: 'login', loadComponent: () => import('./Components/Auth/loginpage/loginpage.component').then(m => m.LoginpageComponent)},
    {path: 'register', loadComponent: () => import('./Components/Auth/registration-page/registration-page.component').then(m => m.RegisterpageComponent)},
];
