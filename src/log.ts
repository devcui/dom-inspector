const sep = '[DomInspector]: ';

/**
 * Logs a message to the console.
 * 将消息记录到控制台
 * @param message - The message to log
 *                  要记录的消息
 * @param args - Additional arguments to log
 *               要记录的附加参数
 */
export function log(message: string, ...args: unknown[]): void {
  console.log(sep + message, ...args);
}

/**
 * Logs a warning message to the console.
 * 将警告消息记录到控制台
 * @param message - The warning message to log
 *                  要记录的警告消息
 * @param args - Additional arguments to log
 *               要记录的附加参数
 */
export function warn(message: string, ...args: unknown[]): void {
  console.warn(sep + message, ...args);
}

/**
 * Logs an error message to the console.
 * 将错误消息记录到控制台
 * @param message - The error message to log
 *                  要记录的错误消息
 * @param args - Additional arguments to log
 *               要记录的附加参数
 */
export function error(message: string, ...args: unknown[]): void {
  console.error(sep + message, ...args);
}