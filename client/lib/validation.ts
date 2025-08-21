export type FieldError = string | null;

export function validateRequired(label: string, value: string): FieldError {
  if (!value || !value.toString().trim()) {
    return `${label} is required`;
  }
  return null;
}

export function validateEmail(value: string): FieldError {
  const email = (value || '').trim();
  if (!email) return 'Email is required';
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) return 'Enter a valid email address';
  return null;
}

export function validateMinLength(
  label: string,
  value: string,
  min: number,
): FieldError {
  if ((value || '').trim().length < min) {
    return `${label} must be at least ${min} characters`;
  }
  return null;
}

export function validatePassword(value: string): FieldError {
  /*const password = (value || '').trim();
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Password must include letters and numbers';
  }*/
  return null;
}

export function validatePasswordMatch(pass: string, confirm: string): FieldError {
  if ((confirm || '').trim() === '') return 'Confirm password is required';
  if (pass !== confirm) return 'Passwords do not match';
  return null;
}

export function focusFirstInvalid(fieldIdsInOrder: string[], errors: Record<string, FieldError>): void {
  for (const fieldId of fieldIdsInOrder) {
    const err = errors[fieldId];
    if (err) {
      const el = document.getElementById(fieldId) as HTMLElement | null;
      if (el && typeof el.focus === 'function') {
        el.focus();
      }
      break;
    }
  }
}


