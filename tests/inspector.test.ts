import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as dom from '../src/dom';
import { DomInspector } from '../src/inspector';
import * as log from '../src/log';
import * as xpath from '../src/xpath';

const createTarget = () => {
  const el = document.createElement('div');
  el.id = 'target-id';
  el.className = 'target';
  document.body.appendChild(el);
  return el;
};

describe('DomInspector', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes and toggles overlay visibility', () => {
    const addSpy = vi.spyOn(document.body, 'addEventListener');
    const removeSpy = vi.spyOn(document.body, 'removeEventListener');
    const inspector = new DomInspector({ root: document.body, theme: 't' });

    inspector.enable();
    expect(inspector.overlay?.parent.style.display).toBe('block');
    expect(addSpy).toHaveBeenCalledWith('mousemove', inspector.throttleOnMove);

    inspector.disable();
    expect(inspector.overlay?.parent.style.display).toBe('none');
    expect(removeSpy).toHaveBeenCalledWith('mousemove', inspector.throttleOnMove);
  });

  it('warns when enabling or disabling without overlay', () => {
    const warnSpy = vi.spyOn(log, 'warn').mockImplementation(() => {});
    const inspector = new DomInspector({ root: document.body, theme: 't' });
    inspector.overlay = undefined as any;
    inspector.enable();
    inspector.disable();
    expect(warnSpy).toHaveBeenCalledTimes(2);
  });

  it('warns when destroyed or missing root/parent', () => {
    const warnSpy = vi.spyOn(log, 'warn').mockImplementation(() => {});
    const inspector = new DomInspector({ root: document.body, theme: 't' });

    inspector.destroyed = true;
    inspector.enable();

    inspector.destroyed = false;
    inspector.overlay!.parent = undefined as any;
    inspector.enable();
    inspector.disable();

    inspector.overlay = { id: 'x' } as any;
    inspector.disable();

    inspector.overlay = {
      id: 'y',
      parent: document.createElement('div'),
    } as any;
    inspector.root = undefined;
    inspector.enable();
    inspector.disable();

    expect(warnSpy).toHaveBeenCalledTimes(6);
  });

  it('enables and disables with click listener when onClick exists', () => {
    const onClick = vi.fn();
    const addSpy = vi.spyOn(document.body, 'addEventListener');
    const removeSpy = vi.spyOn(document.body, 'removeEventListener');
    const inspector = new DomInspector({ root: document.body, theme: 't', onClick });

    inspector.enable();
    expect(addSpy).toHaveBeenCalledWith('click', inspector.throttleOnClick);

    inspector.disable();
    expect(removeSpy).toHaveBeenCalledWith('click', inspector.throttleOnClick);
  });

  it('returns early when root is missing during init', () => {
    const warnSpy = vi.spyOn(log, 'warn').mockImplementation(() => {});
    vi.spyOn(dom, 'select').mockReturnValue(null as any);
    const inspector = new DomInspector({ root: undefined as any, theme: 't' });
    expect(inspector.overlay).toBeUndefined();
    expect(warnSpy).toHaveBeenCalled();
  });

  it('onMove updates overlays when target changes', () => {
    const inspector = new DomInspector({ root: document.body, theme: 't' });
    const target = createTarget();

    const sizeStub = vi.spyOn(dom, 'getElementSize').mockReturnValue({
      x: 10,
      y: 20,
      contentWidth: 40,
      contentHeight: 30,
      padding: { top: 2, right: 2, bottom: 2, left: 2 },
      border: { top: 1, right: 1, bottom: 1, left: 1 },
      margin: { top: 3, right: 4, bottom: 5, left: 6 },
      borderBoxWidth: 50,
      borderBoxHeight: 40,
      zIndex: 1,
      boxSizing: 'border-box',
    });

    inspector.onMove({ target } as any);
    expect(sizeStub).toHaveBeenCalled();
    expect(inspector.overlay?.tips.style.display).toBe('block');
    expect(inspector.target).toBe(target);
  });

  it('onMove toggles reverse tips when near top', () => {
    const inspector = new DomInspector({ root: document.body, theme: 't' });
    const target = createTarget();

    vi.spyOn(dom, 'getElementSize').mockReturnValue({
      x: 0,
      y: 0,
      contentWidth: 10,
      contentHeight: 10,
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      border: { top: 0, right: 0, bottom: 0, left: 0 },
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      borderBoxWidth: 10,
      borderBoxHeight: 10,
      zIndex: null,
      boxSizing: 'border-box',
    });

    inspector.onMove({ target } as any);
    expect(inspector.overlay?.tips.classList.contains('reverse')).toBe(true);
  });

  it('onMove falls back to border-box sizes and normal tips placement', () => {
    const inspector = new DomInspector({ root: document.body, theme: 't' });
    const target = createTarget();

    vi.spyOn(dom, 'getElementSize').mockReturnValue({
      x: 15,
      y: 100,
      padding: { top: 1, right: 2, bottom: 3, left: 4 },
      border: { top: 5, right: 6, bottom: 7, left: 8 },
      margin: {},
      borderBoxWidth: 120,
      borderBoxHeight: 90,
      zIndex: 10,
      boxSizing: 'border-box',
    } as any);

    inspector.onMove({ target } as any);

    expect(inspector.overlay?.tips.classList.contains('reverse')).toBe(false);
    expect(inspector.overlay?.tips.style.display).toBe('block');
  });

  it('onMove early-returns when target repeats', () => {
    const inspector = new DomInspector({ root: document.body, theme: 't' });
    const target = createTarget();
    const sizeStub = vi.spyOn(dom, 'getElementSize').mockReturnValue({
      x: 0,
      y: 40,
      contentWidth: 10,
      contentHeight: 10,
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      border: { top: 0, right: 0, bottom: 0, left: 0 },
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      borderBoxWidth: 10,
      borderBoxHeight: 10,
      zIndex: null,
      boxSizing: 'border-box',
    });

    inspector.onMove({ target } as any);
    inspector.onMove({ target } as any);
    expect(sizeStub).toHaveBeenCalledTimes(1);
  });

  it('onMove skips when cached target or missing size', () => {
    const inspector = new DomInspector({ root: document.body, theme: 't' });
    const target = createTarget();
    const another = document.createElement('div');
    document.body.appendChild(another);
    const sizeStub = vi.spyOn(dom, 'getElementSize').mockReturnValue(null);

    inspector.onMove({ target } as any);
    expect(sizeStub).toHaveBeenCalled();

    sizeStub.mockReturnValue({
      x: 0,
      y: 40,
      contentWidth: 10,
      contentHeight: 10,
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      border: { top: 0, right: 0, bottom: 0, left: 0 },
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      borderBoxWidth: 10,
      borderBoxHeight: 10,
      zIndex: null,
      boxSizing: 'border-box',
    });

    inspector.onMove({ target: another } as any);
    inspector.onMove({ target: another } as any);
    expect(sizeStub).toHaveBeenCalledTimes(2);
  });

  it('onMove tolerates missing tip elements', () => {
    const inspector = new DomInspector({ root: document.body, theme: 't' });
    const target = createTarget();
    vi.spyOn(dom, 'getElementSize').mockReturnValue({
      x: 5,
      y: 5,
      contentWidth: 10,
      contentHeight: 10,
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      border: { top: 0, right: 0, bottom: 0, left: 0 },
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      borderBoxWidth: 10,
      borderBoxHeight: 10,
      zIndex: null,
      boxSizing: 'border-box',
    });

    const selectSpy = vi.spyOn(dom, 'select');
    selectSpy
      .mockReturnValueOnce(null as any)
      .mockReturnValueOnce(null as any)
      .mockReturnValueOnce(null as any)
      .mockReturnValueOnce(null as any);

    inspector.onMove({ target } as any);
    expect(selectSpy).toHaveBeenCalled();
  });

  it('handleClick no-ops when onClick is missing', () => {
    const inspector = new DomInspector({ root: document.body, theme: 't' });
    const event = {
      target: createTarget(),
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      stopImmediatePropagation: vi.fn(),
    } as any;

    inspector.handleClick(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('handleClick skips when target is missing', () => {
    const onClick = vi.fn();
    const inspector = new DomInspector({ root: document.body, theme: 't', onClick });
    const event = {
      target: null,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      stopImmediatePropagation: vi.fn(),
    } as any;

    inspector.handleClick(event);
    expect(onClick).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('handleClick stops event and forwards payload', () => {
    const onClick = vi.fn();
    const inspector = new DomInspector({ root: document.body, theme: 't', onClick });
    const target = createTarget();
    const xpathSpy = vi.spyOn(inspector, 'getXPath').mockReturnValue('/p[1]');
    const event = {
      target,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      stopImmediatePropagation: vi.fn(),
    } as any;

    inspector.handleClick(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(event.stopImmediatePropagation).toHaveBeenCalled();
    expect(xpathSpy).toHaveBeenCalledWith(target);
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({
        tag: target.tagName.toLowerCase(),
        xpath: '/p[1]',
        element: target,
        event,
      })
    );
  });

  it('handleClick falls back to cached target when event target is missing', () => {
    const onClick = vi.fn();
    const inspector = new DomInspector({ root: document.body, theme: 't', onClick });
    const target = createTarget();
    inspector.target = target;
    const xpathSpy = vi.spyOn(inspector, 'getXPath').mockReturnValue('/div[1]');

    const event = {
      target: undefined,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      stopImmediatePropagation: vi.fn(),
    } as any;

    inspector.handleClick(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(xpathSpy).toHaveBeenCalledWith(target);
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({
        tag: 'div',
        xpath: '/div[1]',
        element: target,
      })
    );
  });

  it('getXPath delegates and warns on missing element', () => {
    const warnSpy = vi.spyOn(log, 'warn').mockImplementation(() => {});
    const delegate = vi.spyOn(xpath, 'getXpath').mockReturnValue('x');
    const inspector = new DomInspector({ root: document.body, theme: 't' });

    expect(inspector.getXPath(null as any)).toBeNull();
    expect(warnSpy).toHaveBeenCalled();

    const target = createTarget();
    expect(inspector.getXPath(target)).toBe('x');
    expect(delegate).toHaveBeenCalledWith(target);
  });

  it('destroy disables and marks destroyed', () => {
    const inspector = new DomInspector({ root: document.body, theme: 't' });
    const disableSpy = vi.spyOn(inspector, 'disable');
    inspector.destroy();
    expect(disableSpy).toHaveBeenCalled();
    expect(inspector.destroyed).toBe(true);
    expect(inspector.overlay).toBeUndefined();
  });
});
