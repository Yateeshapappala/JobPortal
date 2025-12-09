import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../Services/Auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true; // allow navigation
  }

  // redirect to login page
  router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
  return false;
};