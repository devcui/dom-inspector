import { describe, expect, it, vi } from 'vitest';
import { error, log, warn } from '../src/log';

describe('log helpers', () => {
  it('prefixes log', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    log('hello', 1);
    expect(spy).toHaveBeenCalledWith('[DomInspector]: ' + 'hello', 1);
  });

  it('prefixes warn', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    warn('w');
    expect(spy).toHaveBeenCalledWith('[DomInspector]: ' + 'w');
  });

  it('prefixes error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    error('oops', { x: 1 });
    expect(spy).toHaveBeenCalledWith('[DomInspector]: ' + 'oops', { x: 1 });
  });
});
