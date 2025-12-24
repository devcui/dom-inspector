/**
 * Mixes the properties of the source object into the target object
 * 将源对象的属性混入到目标对象中
 *
 * @param target - The target object, will be modified and returned
 *                 目标对象，将被修改并返回
 * @param source - The source object, its own properties will be copied to the target
 *                 源对象，其自身属性将被复制到目标对象
 * @returns The mixed target object containing properties from both
 *          混入后的目标对象，包含两者的属性
 */
export function mixin<T extends object, U extends object>(target: T, source: U): T & U {
  const targetCopy = target as T & U;
  Object.keys(source).forEach((item) => {
    if ({}.hasOwnProperty.call(source, item)) {
      (targetCopy as Record<string, unknown>)[item] = (source as Record<string, unknown>)[item];
    }
  });
  return targetCopy;
}
