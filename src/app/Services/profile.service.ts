import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../Models/user.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private userSubject = new BehaviorSubject<User | null>(
    this.getUserFromLocalStorage()
  );
  user$ = this.userSubject.asObservable();

  constructor() {}

  private getUserFromLocalStorage(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  updateSection(section: keyof User, data: any) {
    const user = this.userSubject.value;
    if (!user) return;

    const updatedUser: User = {
      ...user,
      [section]: data,
    };

    this.persistUser(updatedUser);
  }

  updateUser(updatedUser: User) {
    this.persistUser(updatedUser);
  }

  private persistUser(updatedUser: User) {
    localStorage.setItem('user', JSON.stringify(updatedUser));

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const index = users.findIndex(
      (u: User) => u.username === updatedUser.username
    );

    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem('users', JSON.stringify(users));
    }

    // notify global subscribers
    this.userSubject.next({ ...updatedUser });
  }
}
