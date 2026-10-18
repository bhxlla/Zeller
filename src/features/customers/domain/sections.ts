import type { Customer } from './customer';

export type CustomerSection = {
  title: string;
  data: Customer[];
};

/** Section title for names that don't start with a letter. Sorted after A–Z. */
export const OTHER_SECTION_TITLE = '#';

const compareNames = (a: Customer, b: Customer) =>
  a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });

/** The uppercase first letter of a name, or `#` if it doesn't start with a letter. */
export function initialOf(name: string): string {
  const initial = name.trim().charAt(0).toUpperCase();
  return /^[A-Z]$/.test(initial) ? initial : OTHER_SECTION_TITLE;
}

/** Groups customers into alphabetical sections by first letter of their name, for a SectionList. */
export function groupByInitial(customers: readonly Customer[]): CustomerSection[] {
  const sections = new Map<string, Customer[]>();

  for (const customer of [...customers].sort(compareNames)) {
    const title = initialOf(customer.name);
    const section = sections.get(title);
    if (section) section.push(customer);
    else sections.set(title, [customer]);
  }

  return [...sections.entries()]
    .map(([title, data]) => ({ title, data }))
    .sort((a, b) => {
      if (a.title === OTHER_SECTION_TITLE) return 1;
      if (b.title === OTHER_SECTION_TITLE) return -1;
      return a.title.localeCompare(b.title);
    });
}
