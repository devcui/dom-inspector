import { describe, expect, it } from 'vitest';
import { mixin } from '../src/mixin';

describe('mixin', () => {
  it('merges source into target', () => {
    const target = { a: 1 };
    const source = { b: 2 };
    const result = mixin(target, source);
    expect(result).toEqual({ a: 1, b: 2 });
  });
});
