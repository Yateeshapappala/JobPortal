import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../Services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnDestroy {
  isLoggedIn = false;
  username = '';
  showMenu = false;
  isJobsPage = false;
  isHomePage = false;
  showGuestAuthOnJobs = false; // NEW: true only when guest arrived at /jobs from home
  private sub = new Subscription();

  constructor(private auth: AuthService, private router: Router) {
    // Subscribe to login state
    this.sub.add(
      this.auth.isLoggedIn$.subscribe((v) => {
        this.isLoggedIn = v;
        const user = this.auth.getUser();
        this.username = user
          ? user.fullName || user.username || user.email
          : '';
        // Recompute showGuestAuthOnJobs when auth state changes (so buttons hide immediately after login)
        this.updateGuestAuthFlag();
      })
    );

    // route detection and update flags
    this.sub.add(
      this.router.events.subscribe((ev) => {
        if (ev instanceof NavigationEnd) {
          const url = ev.urlAfterRedirects.split('?')[0].split('#')[0] || '/';
          this.isJobsPage = url.startsWith('/jobs');
          this.isHomePage = url === '/' || url === ''; // <-- set home flag
          this.updateGuestAuthFlag();
        }
      })
    );

    // initial values
    const initialUser = this.auth.getUser();
    this.isLoggedIn = this.auth.isLoggedIn();
    this.username = initialUser
      ? initialUser.fullName || initialUser.username || initialUser.email
      : '';
    const currentUrl = this.router.url.split('?')[0].split('#')[0] || '/';
    this.isJobsPage = currentUrl.startsWith('/jobs');
    this.isHomePage = currentUrl === '/' || currentUrl === '';
    this.updateGuestAuthFlag();
  }

  private updateGuestAuthFlag() {
    // Show Login/Register on /jobs only when:
    // - user is not logged in
    // - current route is a jobs route (startsWith '/jobs')
    // - the lastRoute (from sessionStorage) equals '/' (meaning user came from home)
    try {
      const currentUrl =
        (this.router.url || '').split('?')[0].split('#')[0] || '/';
      const isJobsRoute = currentUrl.startsWith('/jobs');
      const lastRoute = sessionStorage.getItem('lastRoute') || '/';
      this.showGuestAuthOnJobs =
        !this.isLoggedIn && isJobsRoute && lastRoute === '/';
    } catch (e) {
      // on any error be conservative: hide guest buttons
      this.showGuestAuthOnJobs = false;
    }
  }

  onBrandClick() {
    if (this.isLoggedIn) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/']);
    }
  }

  goToProfile() {
    this.showMenu = false;
    this.router.navigate(['/profile']);
  }

  logout() {
    this.showMenu = false;
    this.auth.logout();
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
