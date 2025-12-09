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
    const dummyToken = this.generateDummyToken(user);

    localStorage.setItem('token', dummyToken);
    localStorage.setItem('user', JSON.stringify(user));

    return true;
  }
  return false;
}

private generateDummyToken(user: any): string {
  // Create a fake token payload
  const payload = {
    username: user.username,
    fullName: user.fullName,
    email: user.email,
    exp: Date.now() + 60 * 60 * 1000 // expires in 1 hour
  };

  // Encode as base64 to look like a token
  return btoa(JSON.stringify(payload));
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
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  this.router.navigate(['/login']);
}


  getUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

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

}
