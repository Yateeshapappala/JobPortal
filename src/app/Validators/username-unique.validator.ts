import { AbstractControl, ValidationErrors } from '@angular/forms';
import { of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export function usernameUniqueValidator() {
  return (control: AbstractControl) => {
    const username = control.value;
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    const exists = users.some((u: any) => u.username === username);

    return of(exists).pipe(
      delay(400), // simulate async call
      map(isTaken => (isTaken ? { usernameTaken: true } : null))
    );
  };
}
