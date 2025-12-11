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

  // route fragments that should hide the navbar (exact or substring match)
  private hideOn = ['/login', '/register'];

  constructor(private router: Router, private auth: AuthService) {
    // refresh auth state
    this.auth.refreshLoginStatus();

    // initialize based on current url (works on first load)
    this.setHideNavbarFromUrl(this.router.url);

    // subscribe to navigation events to update on route change
    this.router.events.subscribe(ev => {
      if (ev instanceof NavigationEnd) {
        const url = ev.urlAfterRedirects || ev.url;
        // debug log - remove later if you want
        console.log('[AppComponent] NavigationEnd ->', url);
        this.setHideNavbarFromUrl(url);
      }
    });
  }

  private setHideNavbarFromUrl(rawUrl: string) {
    // normalize: drop query string and hash
    const url = (rawUrl || '').split('?')[0].split('#')[0] || '/';
    // hide if url exactly matches or contains any hideOn fragment (safe)
    const shouldHide = this.hideOn.some(fragment => {
      // exact match (e.g. '/login') OR startsWith fragment, OR contains (fallback)
      return url === fragment || url.startsWith(fragment) || url.includes(fragment);
    });
    this.hideNavbar = shouldHide;
    console.log('[AppComponent] hideNavbar ->', this.hideNavbar, ' (url: ' + url + ')');
  }
}
