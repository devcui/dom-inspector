/**
 * Creates a throttled function that only invokes the provided function at most once per specified time period
 * 创建一个节流函数，在指定时间周期内最多只执行一次提供的函数
 *
 * @param func - The function to throttle
 *               需要节流的函数
 * @param wait - The number of milliseconds to wait between invocations (default: 100)
 *               两次调用之间等待的毫秒数（默认：100）
 * @returns A throttled version of the provided function
 *          提供函数的节流版本
 */
export function throttle<T extends (...args: any[]) => void>(func: T, wait = 100): (...args: Parameters<T>) => void {
  let lastTime = 0;
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: unknown;

  return function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now();
    const remaining = wait - (now - lastTime);

    lastArgs = args;
    lastThis = this;

    if (remaining <= 0) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      lastTime = now;
      func.apply(lastThis, lastArgs);
      lastArgs = null;
    } else if (!timeout) {
      timeout = setTimeout(() => {
        lastTime = Date.now();
        timeout = null;

        if (lastArgs) {
          func.apply(lastThis, lastArgs);
          lastArgs = null;
        }
      }, remaining);
    }
  };
}
