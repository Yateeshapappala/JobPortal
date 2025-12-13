import { AbstractControl, ValidationErrors } from '@angular/forms';

export function EmailValidator(
  control: AbstractControl
): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  const strictEmailRegex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  return strictEmailRegex.test(value)
    ? null
    : { strictEmail: true };
}
