export const MAX_NAME_LENGTH = 50;

const LETTERS_AND_SPACES = /^[A-Za-z ]+$/;

function validateNamePart(value: string, required: boolean): string | null {
  const trimmed = value.trim();
  if (!trimmed) return required ? 'Required' : null;
  if (!LETTERS_AND_SPACES.test(trimmed)) return 'Only letters and spaces are allowed';
  return null;
}

export const validateFirstName = (value: string) => validateNamePart(value, true);

export const validateLastName = (value: string) => validateNamePart(value, false);

/** Joins first and last name into the single `name` we store. */
export function toFullName(firstName: string, lastName: string): string {
  return [firstName, lastName]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(' ');
}

export function validateFullNameLength(firstName: string, lastName: string): string | null {
  return toFullName(firstName, lastName).length > MAX_NAME_LENGTH
    ? `Name must be ${MAX_NAME_LENGTH} characters or fewer`
    : null;
}
