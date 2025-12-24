import { afterEach, describe, expect, it, vi } from 'vitest';
import { addCss, createElement, createSurroundElement, findPosition, findTagIndex, getElementSize, getMaxZIndex, isDom, select } from '../src/dom';
import * as log from '../src/log';

const originalGetComputedStyle = global.getComputedStyle;

function mockComputedStyle(values: Partial<CSSStyleDeclaration>) {
  return vi.spyOn(global, 'getComputedStyle').mockImplementation((el: Element) => {
    // Minimal computed style mock covering the fields we read
    return {
      getPropertyValue: () => '',
      ...values,
    } as unknown as CSSStyleDeclaration;
  });
}

describe('dom utilities', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
    Object.defineProperty(window, 'frameElement', { value: null, writable: true });
    Object.defineProperty(window, 'parent', { value: window, writable: true });
  });

  it('select returns element under given parent', () => {
    const parent = document.createElement('div');
    parent.innerHTML = '<span class="hit"></span>';
    document.body.appendChild(parent);
    expect(select('.hit', parent)).not.toBeNull();
  });

  it('isDom identifies elements', () => {
    const el = document.createElement('div');
    expect(isDom(el)).toBe(true);
    expect(isDom({})).toBe(false);
  });

  it('addCss applies style values and skips nullish', () => {
    const el = document.createElement('div');
    addCss(el, { color: 'red', marginTop: undefined });
    expect(el.style.color).toBe('red');
    expect(el.style.marginTop).toBe('');
  });

  it('findTagIndex counts matching previous siblings', () => {
    const parent = document.createElement('div');
    parent.innerHTML = '<div></div><span></span><span id="b"></span><span></span>';
    const target = parent.querySelector('#b') as HTMLElement;
    expect(findTagIndex(target, 'span')).toBe(2);
  });

  it('findPosition returns coordinates minus margins', () => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'getBoundingClientRect', {
      value: () => ({ left: 20, top: 30, right: 0, bottom: 0, width: 0, height: 0 }),
    });
    mockComputedStyle({ marginLeft: '5', marginTop: '3' });
    const pos = findPosition(el as HTMLElement);
    expect(pos).toEqual({ x: 15, y: 27 });
  });

  it('findPosition includes frame offsets when frameElement present', () => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'getBoundingClientRect', {
      value: () => ({ left: 5, top: 5, right: 0, bottom: 0, width: 0, height: 0 }),
    });
    const frame = document.createElement('iframe');
    Object.defineProperty(frame, 'getBoundingClientRect', {
      value: () => ({ left: 10, top: 10, right: 0, bottom: 0, width: 0, height: 0 }),
    });
    const frameStyle = { marginLeft: '1', marginTop: '2' } as Partial<CSSStyleDeclaration>;

    vi.spyOn(global, 'getComputedStyle').mockImplementation((node: Element) => {
      if (node === frame) {
        return { getPropertyValue: () => '', ...frameStyle } as unknown as CSSStyleDeclaration;
      }
      return { getPropertyValue: () => '', marginLeft: '2', marginTop: '3' } as unknown as CSSStyleDeclaration;
    });

    const win = el.ownerDocument.defaultView as any;
    Object.defineProperty(win, 'frameElement', { value: frame, writable: true });
    Object.defineProperty(win, 'parent', { value: { frameElement: null }, writable: true });

    const pos = findPosition(el as HTMLElement);
    expect(pos).toEqual({ x: 12, y: 10 });
  });

  it('getElementSize computes box metrics', () => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'offsetWidth', { value: 120 });
    Object.defineProperty(el, 'offsetHeight', { value: 60 });
    Object.defineProperty(el, 'getBoundingClientRect', {
      value: () => ({ left: 50, top: 40, right: 0, bottom: 0, width: 120, height: 60 }),
    });

    mockComputedStyle({
      marginTop: '10',
      marginRight: '8',
      marginBottom: '6',
      marginLeft: '4',
      paddingTop: '5',
      paddingRight: '3',
      paddingBottom: '5',
      paddingLeft: '3',
      borderTopWidth: '2',
      borderRightWidth: '2',
      borderBottomWidth: '2',
      borderLeftWidth: '2',
      boxSizing: 'content-box',
      zIndex: '10',
    });

    const size = getElementSize(el);
    expect(size).not.toBeNull();
    expect(size?.x).toBe(46);
    expect(size?.y).toBe(30);
    expect(size?.contentWidth).toBe(120 - 2 - 2 - 3 - 3);
    expect(size?.contentHeight).toBe(60 - 2 - 2 - 5 - 5);
    expect(size?.zIndex).toBe(10);
  });

  it('getElementSize sets zIndex null when auto', () => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'offsetWidth', { value: 10 });
    Object.defineProperty(el, 'offsetHeight', { value: 10 });
    Object.defineProperty(el, 'getBoundingClientRect', {
      value: () => ({ left: 0, top: 0, right: 0, bottom: 0, width: 10, height: 10 }),
    });
    mockComputedStyle({
      marginTop: '0',
      marginRight: '0',
      marginBottom: '0',
      marginLeft: '0',
      paddingTop: '0',
      paddingRight: '0',
      paddingBottom: '0',
      paddingLeft: '0',
      borderTopWidth: '0',
      borderRightWidth: '0',
      borderBottomWidth: '0',
      borderLeftWidth: '0',
      boxSizing: 'border-box',
      zIndex: 'auto',
    });
    const size = getElementSize(el);
    expect(size?.zIndex).toBeNull();
  });

  it('getElementSize returns null and warns for missing element', () => {
    const warnSpy = vi.spyOn(log, 'warn').mockImplementation(() => {});
    expect(getElementSize(null as any)).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
  });

  it('getElementSize handles non-numeric style values gracefully', () => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'offsetWidth', { value: 20 });
    Object.defineProperty(el, 'offsetHeight', { value: 10 });
    Object.defineProperty(el, 'getBoundingClientRect', {
      value: () => ({ left: 0, top: 0, right: 0, bottom: 0, width: 20, height: 10 }),
    });
    mockComputedStyle({ marginTop: 'auto', marginLeft: 'auto', borderTopWidth: 'auto', paddingTop: 'auto', boxSizing: 'border-box', zIndex: '5' });
    const size = getElementSize(el);
    expect(size?.margin.top).toBe(0);
  });

  it('getMaxZIndex scans all elements', () => {
    const a = document.createElement('div');
    const b = document.createElement('div');
    const c = document.createElement('div');
    a.style.zIndex = '3';
    b.style.zIndex = '7';
    c.style.zIndex = 'auto';
    document.body.appendChild(a);
    document.body.appendChild(b);
    document.body.appendChild(c);
    expect(getMaxZIndex()).toBe(7);
  });

  it('getMaxZIndex returns 0 when no elements', () => {
    document.body.innerHTML = '';
    expect(getMaxZIndex()).toBe(0);
  });

  it('createElement and createSurroundElement work', () => {
    const parent = document.createElement('div');
    const child = createElement('span', { id: 'c' }, 'hi');
    parent.appendChild(child);
    const surround = createSurroundElement(parent, 'box', 'text');
    expect(child.id).toBe('c');
    expect(surround.className).toBe('box');
    expect(parent.children.length).toBe(2);
  });
});
