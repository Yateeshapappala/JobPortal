import { AbstractControl, ValidationErrors } from '@angular/forms';

/** Validates that date is in the past */
export function pastDateValidator(
  control: AbstractControl
): ValidationErrors | null {
  if (!control.value) return null;

  const selected = new Date(control.value);
  const today = new Date();

  return selected >= today ? { invalidStart: true } : null;
}

/** Validates end date: must be past & after start date */
export function endDateValidator(
  group: AbstractControl
): ValidationErrors | null {
  const start = group.get('startDate')?.value
    ? new Date(group.get('startDate')?.value)
    : null;
  const end = group.get('endDate')?.value
    ? new Date(group.get('endDate')?.value)
    : null;
  const today = new Date();

  if (!end) return null;

  if (end >= today) {
    return { invalidEnd: true };
  }

  if (start && end <= start) {
    return { beforeStart: true };
  }

  return null;
}
