import { AbstractControl, ValidationErrors } from '@angular/forms';
import { of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export function emailUniqueValidator() {
  return (control: AbstractControl) => {
    const email = control.value;
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    const exists = users.some((u: any) => u.email === email);

    return of(exists).pipe(
      delay(400), // simulate async request
      map(isTaken => (isTaken ? { emailTaken: true } : null))
    );
  };
}
