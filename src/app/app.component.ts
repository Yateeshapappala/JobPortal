import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './Components/DashBoard/navbar/navbar.component';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './Services/Auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'JobPortal';
  hideNavbar = false;
  private hideOn = ['/login', '/register'];

  constructor(private router: Router, private auth: AuthService) {
    this.auth.refreshLoginStatus();

    // initialize based on current url (works on first load)
    this.setHideNavbarFromUrl(this.router.url);
    // seed sessionStorage lastRoute if not present
    if (!sessionStorage.getItem('lastRoute')) {
      sessionStorage.setItem('lastRoute', '/');
    }

    // subscribe to navigation events to update on route change
    this.router.events.subscribe(ev => {
      if (ev instanceof NavigationEnd) {
        const url = ev.urlAfterRedirects || ev.url;
        // store previous route (before this navigation) as lastRoute
        // We store the last route the user WAS on. We can read it when on /jobs.
        // Implementation: read previous from sessionStorage 'currentRoute' if set, then update it.
        const prev = sessionStorage.getItem('currentRoute') || '/';
        sessionStorage.setItem('lastRoute', prev);
        // now update currentRoute to the route we just arrived at
        sessionStorage.setItem('currentRoute', url);

        // redirect logged-in users visiting '/' to '/dashboard'
        const normalized = url.split('?')[0].split('#')[0] || '/';
        if ((normalized === '/' || normalized === '') && this.auth.isLoggedIn()) {
          // small timeout to avoid navigation during NavigationEnd handling
          setTimeout(() => this.router.navigate(['/dashboard']), 0);
        }

        // update hide navbar state
        this.setHideNavbarFromUrl(url);
      }
    });
  }

  private setHideNavbarFromUrl(rawUrl: string) {
    const url = (rawUrl || '').split('?')[0].split('#')[0] || '/';
    const shouldHide = this.hideOn.some(fragment => {
      return url === fragment || url.startsWith(fragment) || url.includes(fragment);
    });
    this.hideNavbar = shouldHide;
  }
}
