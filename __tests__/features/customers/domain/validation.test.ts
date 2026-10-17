import {
  MAX_NAME_LENGTH,
  toFullName,
  validateEmail,
  validateFirstName,
  validateFullNameLength,
  validateLastName,
} from '@/features/customers/domain/validation';

describe('validateFirstName', () => {
  it.each(['Barbara', 'Mary Ann', '  Brad  '])('accepts %p', (value) => {
    expect(validateFirstName(value)).toBeNull();
  });

  it.each(['', '   '])('requires a value (%p)', (value) => {
    expect(validateFirstName(value)).toBe('Required');
  });

  it.each(['Brad1', "O'Brien", 'Anne-Marie', 'José', 'Brad!'])(
    'rejects special characters (%p)',
    (value) => {
      expect(validateFirstName(value)).toBe('Only letters and spaces are allowed');
    },
  );
});

describe('validateLastName', () => {
  it.each(['', '   '])('is optional (%p)', (value) => {
    expect(validateLastName(value)).toBeNull();
  });

  it('accepts letters and spaces', () => {
    expect(validateLastName('Boyle IV')).toBeNull();
  });

  it('rejects special characters when provided', () => {
    expect(validateLastName('Boyle-4')).toBe('Only letters and spaces are allowed');
  });
});

describe('toFullName', () => {
  it('joins trimmed parts with a single space', () => {
    expect(toFullName('  Cecil ', ' Boyle IV ')).toBe('Cecil Boyle IV');
  });

  it('omits an empty last name', () => {
    expect(toFullName('Brad', '  ')).toBe('Brad');
  });
});

describe('validateFullNameLength', () => {
  it(`accepts exactly ${MAX_NAME_LENGTH} characters including the joining space`, () => {
    const first = 'a'.repeat(24);
    const last = 'b'.repeat(25);
    expect(validateFullNameLength(first, last)).toBeNull();
  });

  it(`rejects more than ${MAX_NAME_LENGTH} characters`, () => {
    const first = 'a'.repeat(25);
    const last = 'b'.repeat(25);
    expect(validateFullNameLength(first, last)).toBe('Name must be 50 characters or fewer');
  });

  it('ignores surrounding whitespace when counting', () => {
    expect(validateFullNameLength(`  ${'a'.repeat(50)}  `, '')).toBeNull();
  });
});

describe('validateEmail', () => {
  it.each(['', '   '])('is optional (%p)', (value) => {
    expect(validateEmail(value)).toBeNull();
  });

  it.each(['test1@test.com', 'first.last+tag@sub.example.com.au', '  brad@zeller.com  '])(
    'accepts %p',
    (value) => {
      expect(validateEmail(value)).toBeNull();
    },
  );

  it.each(['brad', 'brad@', '@zeller.com', 'brad@zeller', 'brad @zeller.com', 'a@b@c.com'])(
    'rejects %p',
    (value) => {
      expect(validateEmail(value)).toBe('Enter a valid email address');
    },
  );
});
