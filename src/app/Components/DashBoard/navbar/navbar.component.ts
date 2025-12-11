import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Required for routerLink

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  // TOGGLE THIS to 'false' to see what the Guest view looks like!
  isLoggedIn: boolean =true; 
  
  // Dummy user name for the demo
  username: string = 'Devi';

  logout() {
    this.isLoggedIn = false;
    // In real app: navigate to login page
  }
}