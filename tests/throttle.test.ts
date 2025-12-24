import { describe, expect, it, vi } from 'vitest';
import { throttle } from '../src/throttle';

describe('throttle', () => {
  it('throttles calls with trailing execution', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled('a');
    throttled('b');
    throttled('c');

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('a');

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith('c');

    vi.useRealTimers();
  });

  it('clears pending timeout when new call is late', () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled('first');
    vi.setSystemTime(200); // move time forward without running pending timeout
    throttled('second');

    // pending timeout should be cleared and immediate call happens with the latest args (trailing one canceled)
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenLastCalledWith('second');

    vi.useRealTimers();
  });

  it('clears pending timeout and executes latest args when time has passed', () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled('first');
    // Do not run scheduled timeout; just move clock forward so remaining becomes <= 0 while a timeout exists
    vi.setSystemTime(150);
    throttled('second');

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenLastCalledWith('second');

    vi.useRealTimers();
  });
});
