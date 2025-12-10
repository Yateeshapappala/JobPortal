import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

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
  private users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
  private loggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  isLoggedIn$ = this.loggedInSubject.asObservable();

  constructor(private router: Router) {}

  // -------------------------- LOGIN --------------------------

  login(username: string, password: string, rememberMe: boolean): boolean {
      username = username.trim().toLowerCase();
    const user = this.users.find(
      (u) =>
        (u.username === username || u.email === username) &&
        u.password === password
    );

    if (user) {
      // 1 hour or 7 days based on rememberMe
      const expires = rememberMe
        ? Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
        : Date.now() + 60 * 60 * 1000; // 1 hour

      const token = this.generateToken(user, expires);

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('rememberMe', rememberMe.toString());
      // Notify subscribers about login status change
      this.loggedInSubject.next(true);

      return true;
    }

    return false;
  }

  // -------------------------- TOKEN --------------------------

  private generateToken(user: User, exp: number): string {
    const payload = {
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      exp: exp,
    };

    return btoa(JSON.stringify(payload));
  }

  // -------------------------- REGISTER --------------------------

  register(user: User) {
    const exists = this.users.find((u) => u.username === user.username);

    if (exists) {
      return { success: false, message: 'Username already exists.' };
    }

    const emailExists = this.users.some((u) => u.email === user.email);
    if (emailExists) {
      return { success: false, message: 'Email already exists.' };
    }

    this.users.push(user);
    localStorage.setItem('users', JSON.stringify(this.users));
    return { success: true, message: 'User registered.' };
  }

  // -------------------------- LOGOUT -------------------------

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');

    this.loggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  // -------------------------- USER DATA --------------------------
  getUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // -------------------------- LOGIN STATE CHECK --------------------------
  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token));
      return payload.exp > Date.now();
    } catch {
      return false;
    }
  }
  refreshLoginStatus() {
    this.loggedInSubject.next(this.isLoggedIn());
  }
}
