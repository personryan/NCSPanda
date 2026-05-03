import { describe, expect, it } from 'vitest';
import { formatLocalDateInputValue } from './date';

describe('formatLocalDateInputValue', () => {
  it('formats a Date with local calendar fields for date inputs', () => {
    expect(formatLocalDateInputValue(new Date(2026, 4, 3, 23, 30))).toBe('2026-05-03');
  });

  it('pads month and day values', () => {
    expect(formatLocalDateInputValue(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});
