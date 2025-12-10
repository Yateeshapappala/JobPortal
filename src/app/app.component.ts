import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './Services/Auth.service';

import { NavbarComponent } from './Components/DashBoard/navbar/navbar.component';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet,NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'JobPortal';
  
  ngOnInit() {
  this.auth.refreshLoginStatus();
  
}
  constructor(private auth: AuthService) {}

}
