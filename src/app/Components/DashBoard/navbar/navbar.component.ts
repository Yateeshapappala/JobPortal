import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../Services/Auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnDestroy {
  isLoggedIn = false;
  username = '';
  showMenu = false;
  isDashboardOrJobsPage = false;
  private sub = new Subscription();

  constructor(private auth: AuthService, private router: Router) {
    // Subscribe to login state
    this.sub.add(
      this.auth.isLoggedIn$.subscribe((v) => {
        this.isLoggedIn = v;
        const user = this.auth.getUser();
        this.username = user ? (user.fullName || user.username) : '';
      })
    );

    // Detect route changes to hide Find Jobs on dashboard or jobs pages
    this.sub.add(
      this.router.events.subscribe(ev => {
        if (ev instanceof NavigationEnd) {
          const url = ev.urlAfterRedirects.split('?')[0].split('#')[0] || '/';
          this.isDashboardOrJobsPage =
            url.startsWith('/dashboard') || url.startsWith('/jobs');
        }
      })
    );

    // Initial sync
    const initialUser = this.auth.getUser();
    this.isLoggedIn = this.auth.isLoggedIn();
    this.username = initialUser ? (initialUser.fullName || initialUser.username) : '';

    // Initial route check
    const currentUrl = this.router.url.split('?')[0].split('#')[0] || '/';
    this.isDashboardOrJobsPage =
      currentUrl.startsWith('/dashboard') || currentUrl.startsWith('/jobs');
  }

  // Brand click: go to dashboard when authenticated, else home
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
