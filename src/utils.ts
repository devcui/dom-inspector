/**
 * checks if the given value is null.
 * 判断传入的值是否为 null。
 * @param maybeNull - The value to check
 *                   要检查的值
 * @returns True if the value is null, false otherwise
 *          如果值为 null 则返回 true，否则返回 false
 */
export function isNull(maybeNull: unknown): boolean {
  return maybeNull === null;
}
