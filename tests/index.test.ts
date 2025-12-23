import { describe, expect, it, vi } from 'vitest';
import type { ElementInfo } from '../src/index';
import { add, createInspector, divide, greet, LIBRARY_NAME, multiply, subtract, VERSION } from '../src/index';

describe('Greeting Functions', () => {
  it('should greet with the provided name', () => {
    expect(greet('World')).toBe('Hello, World!');
    expect(greet('TypeScript')).toBe('Hello, TypeScript!');
  });

  it('should handle empty string', () => {
    expect(greet('')).toBe('Hello, !');
  });
});

describe('Math Functions', () => {
  describe('add', () => {
    it('should add two positive numbers', () => {
      expect(add(2, 3)).toBe(5);
    });

    it('should add negative numbers', () => {
      expect(add(-1, -2)).toBe(-3);
    });

    it('should add zero', () => {
      expect(add(5, 0)).toBe(5);
    });
  });

  describe('subtract', () => {
    it('should subtract two numbers', () => {
      expect(subtract(5, 3)).toBe(2);
    });

    it('should handle negative results', () => {
      expect(subtract(3, 5)).toBe(-2);
    });
  });

  describe('multiply', () => {
    it('should multiply two numbers', () => {
      expect(multiply(3, 4)).toBe(12);
    });

    it('should handle zero', () => {
      expect(multiply(5, 0)).toBe(0);
    });

    it('should handle negative numbers', () => {
      expect(multiply(-2, 3)).toBe(-6);
    });
  });

  describe('divide', () => {
    it('should divide two numbers', () => {
      expect(divide(10, 2)).toBe(5);
    });

    it('should handle decimal results', () => {
      expect(divide(5, 2)).toBe(2.5);
    });

    it('should throw error on division by zero', () => {
      expect(() => divide(10, 0)).toThrow('Division by zero is not allowed');
    });
  });
});

describe('Inspector', () => {
  describe('createInspector', () => {
    it('should create inspector with default options', () => {
      const inspector = createInspector();
      const config = inspector.getConfig();

      expect(config.debug).toBe(false);
      expect(config.prefix).toBe('[DomInspector]');
    });

    it('should create inspector with custom options', () => {
      const inspector = createInspector({ debug: true, prefix: '[Custom]' });
      const config = inspector.getConfig();

      expect(config.debug).toBe(true);
      expect(config.prefix).toBe('[Custom]');
    });

    it('should merge partial options with defaults', () => {
      const inspector = createInspector({ debug: true });
      const config = inspector.getConfig();

      expect(config.debug).toBe(true);
      expect(config.prefix).toBe('[DomInspector]');
    });
  });

  describe('log', () => {
    it('should return formatted message', () => {
      const inspector = createInspector();
      const result = inspector.log('test message');

      expect(result).toBe('[DomInspector] test message');
    });

    it('should use custom prefix', () => {
      const inspector = createInspector({ prefix: '[Test]' });
      const result = inspector.log('message');

      expect(result).toBe('[Test] message');
    });

    it('should console.log when debug is true', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const inspector = createInspector({ debug: true });

      inspector.log('debug message');

      expect(consoleSpy).toHaveBeenCalledWith('[DomInspector] debug message');
      consoleSpy.mockRestore();
    });

    it('should not console.log when debug is false', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const inspector = createInspector({ debug: false });

      inspector.log('message');

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('formatElementInfo', () => {
    it('should format element with tag only', () => {
      const inspector = createInspector();
      const info: ElementInfo = {
        tagName: 'div',
        id: null,
        classList: [],
        attributes: {},
        childCount: 0,
      };

      expect(inspector.formatElementInfo(info)).toBe('div');
    });

    it('should format element with id', () => {
      const inspector = createInspector();
      const info: ElementInfo = {
        tagName: 'div',
        id: 'main',
        classList: [],
        attributes: {},
        childCount: 0,
      };

      expect(inspector.formatElementInfo(info)).toBe('div#main');
    });

    it('should format element with classes', () => {
      const inspector = createInspector();
      const info: ElementInfo = {
        tagName: 'div',
        id: null,
        classList: ['container', 'active'],
        attributes: {},
        childCount: 0,
      };

      expect(inspector.formatElementInfo(info)).toBe('div.container.active');
    });

    it('should format element with id and classes', () => {
      const inspector = createInspector();
      const info: ElementInfo = {
        tagName: 'div',
        id: 'main',
        classList: ['container', 'flex'],
        attributes: {},
        childCount: 0,
      };

      expect(inspector.formatElementInfo(info)).toBe('div#main.container.flex');
    });
  });
});

describe('Constants', () => {
  it('should export VERSION', () => {
    expect(VERSION).toBe('1.1.0');
  });

  it('should export LIBRARY_NAME', () => {
    expect(LIBRARY_NAME).toBe('dom-inspector');
  });
});
