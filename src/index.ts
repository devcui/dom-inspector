/**
 * DOM Inspector Library
 * A simple utility library for DOM inspection
 */

export interface InspectorOptions {
  /** Enable debug mode */
  debug?: boolean;
  /** Custom prefix for output */
  prefix?: string;
}

export interface ElementInfo {
  tagName: string;
  id: string | null;
  classList: string[];
  attributes: Record<string, string>;
  childCount: number;
}

/**
 * Default options for the inspector
 */
const defaultOptions: InspectorOptions = {
  debug: false,
  prefix: '[DomInspector]',
};

/**
 * Greeting function - Hello World
 * @param name - The name to greet
 * @returns A greeting message
 */
export function greet(name: string): string {
  return `Hello, ${name}!`;
}

/**
 * Add two numbers
 * @param a - First number
 * @param b - Second number
 * @returns Sum of a and b
 */
export function add(a: number, b: number): number {
  return a + b;
}

/**
 * Subtract two numbers
 * @param a - First number
 * @param b - Second number
 * @returns Difference of a and b
 */
export function subtract(a: number, b: number): number {
  return a - b;
}

/**
 * Multiply two numbers
 * @param a - First number
 * @param b - Second number
 * @returns Product of a and b
 */
export function multiply(a: number, b: number): number {
  return a * b;
}

/**
 * Calculate the power of a number
 * @param base - The base number
 * @param exponent - The exponent
 * @returns base raised to the power of exponent
 */
export function power(base: number, exponent: number): number {
  return Math.pow(base, exponent);
}

/**
 * Calculate the modulo of two numbers
 * @param a - Dividend
 * @param b - Divisor
 * @returns Remainder of a divided by b
 * @throws Error if b is zero
 */
export function modulo(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Modulo by zero is not allowed');
  }
  return a % b;
}

/**
 * Calculate the absolute value of a number
 * @param n - The number
 * @returns Absolute value of n
 */
export function abs(n: number): number {
  return Math.abs(n);
}

/**
 * Divide two numbers
 * @param a - Dividend
 * @param b - Divisor
 * @returns Quotient of a and b
 * @throws Error if divisor is zero
 */
export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Cannot divide by zero');
  }
  return a / b;
}

/**
 * Create an inspector instance
 * @param options - Inspector options
 * @returns Inspector instance with utility methods
 */
export function createInspector(options: InspectorOptions = {}) {
  const config = { ...defaultOptions, ...options };

  return {
    /**
     * Get the current configuration
     */
    getConfig(): InspectorOptions {
      return { ...config };
    },

    /**
     * Log a message with the configured prefix
     * @param message - Message to log
     */
    log(message: string): string {
      const output = `${config.prefix} ${message}`;
      if (config.debug) {
        // eslint-disable-next-line no-console
        console.log(output);
      }
      return output;
    },

    /**
     * Format element info as a string
     * @param info - Element information
     */
    formatElementInfo(info: ElementInfo): string {
      const parts = [info.tagName];
      if (info.id) {
        parts.push(`#${info.id}`);
      }
      if (info.classList.length > 0) {
        parts.push(`.${info.classList.join('.')}`);
      }
      return parts.join('');
    },
  };
}

/**
 * Version of the library
 */
export const VERSION = '1.2.0';

/**
 * Library name
 */
export const LIBRARY_NAME = 'dom-inspector';

// Default export
export default {
  greet,
  add,
  subtract,
  multiply,
  divide,
  createInspector,
  VERSION,
  LIBRARY_NAME,
};
