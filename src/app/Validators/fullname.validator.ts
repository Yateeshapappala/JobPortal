import { AbstractControl, ValidationErrors } from '@angular/forms';

export function fullNameValidator(
  control: AbstractControl
): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  const trimmed = value.trim();

  // Must contain at least two words
  const parts = trimmed.split(/\s+/);
  if (parts.length < 2) {
    return { fullName: 'tooShort' };
  }

  // Allow letters, spaces, hyphens, apostrophes
  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;
  if (!nameRegex.test(trimmed)) {
    return { fullName: 'invalidChars' };
  }

  // Length check
  if (trimmed.length < 3 || trimmed.length > 50) {
    return { fullName: 'length' };
  }

  return null;
}
