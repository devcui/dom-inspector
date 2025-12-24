import { describe, expect, it } from 'vitest';
import { isNull } from '../src/utils';

describe('utils', () => {
  it('isNull detects null', () => {
    expect(isNull(null)).toBe(true);
    expect(isNull(undefined)).toBe(false);
  });
});
