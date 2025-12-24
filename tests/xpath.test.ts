import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as log from '../src/log';
import { getDom, getXpath } from '../src/xpath';

describe('xpath helpers', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('builds absolute path for single element', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    expect(getXpath(el)).toBe('/html[1]/body[1]/div[1]');
  });

  it('builds an absolute path with indexes', () => {
    const otherDoc = document.implementation.createHTMLDocument('other');
    const foreign = otherDoc.createElement('section');
    const proxy = new Proxy(foreign, {
      get(target, prop, receiver) {
        if (prop === 'ownerDocument') return null;
        return Reflect.get(target, prop, receiver);
      },
    });

    const path = getXpath(proxy as any);
    expect(path).toBe('/section[1]');
  });

  it('builds indexed path when needed', () => {
    const container = document.createElement('section');
    const a = document.createElement('span');
    const b = document.createElement('span');
    container.appendChild(a);
    container.appendChild(b);
    document.body.appendChild(container);

    const path = getXpath(b)!;
    expect(path).toBe('/html[1]/body[1]/section[1]/span[2]');
    expect(getDom(path)).toBe(b);
  });

  it('resolves XPath within a provided root element', () => {
    const wrapper = document.createElement('section');
    const el = document.createElement('p');
    el.id = 'inside';
    wrapper.appendChild(el);
    document.body.appendChild(wrapper);

    const path = getXpath(el)!;
    expect(getDom(path, wrapper)).toBe(el);
  });

  it('returns null and warns on invalid input', () => {
    const warnSpy = vi.spyOn(log, 'warn').mockImplementation(() => {});
    expect(getXpath(null as any)).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
  });

  it('getDom returns null for empty xpath', () => {
    const warnSpy = vi.spyOn(log, 'warn').mockImplementation(() => {});
    expect(getDom('')).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
  });

  it('getDom falls back to document when ownerDocument is missing on root', () => {
    const evaluateSpy = vi.spyOn(document, 'evaluate');
    const bodyProxy = new Proxy(document.body, {
      get(target, prop, receiver) {
        if (prop === 'ownerDocument') return null;
        return Reflect.get(target, prop, receiver);
      },
    });

    expect(getDom('/html[1]/body[1]', bodyProxy as any)).toBeNull();
    expect(evaluateSpy).toHaveBeenCalled();
  });

  it('getDom returns null when XPath points to a non-element node', () => {
    const el = document.createElement('div');
    el.textContent = 'text';
    document.body.appendChild(el);
    expect(getDom('/html/body/div/text()')).toBeNull();
  });

  it('builds absolute path for first sibling using index 1', () => {
    const container = document.createElement('div');
    const child = document.createElement('p');
    container.appendChild(child);
    document.body.appendChild(container);

    const path = getXpath(child)!;
    expect(path).toBe('/html[1]/body[1]/div[1]/p[1]');
  });
});
