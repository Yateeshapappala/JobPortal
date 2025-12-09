import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

interface User {
  username: string;
  password: string;
  fullName: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private users: User[] = [
    {
      username: 'john',
      password: '123',
      fullName: 'John Doe',
      email: 'john@example.com',
    },
    {
      username: 'jane',
      password: '456',
      fullName: 'Jane Doe',
      email: 'jane@example.com',
    },
  ];

  constructor(private router: Router) {}

  login(username: string, password: string): boolean {
    const user = this.users.find(
      (u) => u.username === username && u.password === password
    );
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      return true;
    }
    return false;
  }

  register(user: any): { success: boolean; message: string } {
    const exists = this.users.find((u) => u.username === user.username);

    if (exists) {
      return { success: false, message: 'Username already exists.' };
    }

    this.users.push(user);
    return { success: true, message: 'User registered.' };
  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  getUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getUser();
  }
}
