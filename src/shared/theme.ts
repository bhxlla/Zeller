/**
 * Design tokens, sampled from the design PNGs (zeller-rn-codechallenge/*.png). Sizes are in points:
 * the mockups are drawn at ~1.14px per point (a 375pt-wide phone).
 */
export const colors = {
  primary: '#0271CE', // buttons, active tab, avatar letters, icons
  primarySoft: '#E8F2FB', // selected pill fill, avatar background
  surface: '#FFFFFF',
  surfaceMuted: '#F6F7F9', // tab and role-picker track
  textPrimary: '#202322', // names, titles, labels
  textSecondary: '#4D5151', // inactive tabs, section letters
  textMuted: '#6D7273', // role label on rows, placeholders
  divider: '#E5E9EA',
  danger: '#C62828', // validation errors and destructive actions (not in the designs)
  onPrimary: '#FFFFFF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  sm: 4, // avatar
  md: 8, // floating action button
  pill: 999, // tabs, role picker, primary button
} as const;

export const typography = {
  title: { fontSize: 20, fontWeight: '500' },
  body: { fontSize: 16, fontWeight: '400' },
  label: { fontSize: 14, fontWeight: '400' },
} as const;

export const sizes = {
  avatar: 40,
  rowHeight: 64,
  tabHeight: 40,
  fab: 56,
  button: 48,
} as const;
