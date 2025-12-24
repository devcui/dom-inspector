import { warn } from './log';

/**
 * Checks if the given value is a DOM element.
 * 检查给定值是否为 DOM 元素
 * @param value - The value to check
 *                要检查的值
 * @returns True if the value is a DOM element, false otherwise
 *          如果值为 DOM 元素则返回 true，否则返回 false
 */
export function isDom(value: unknown): value is HTMLElement {
  return value instanceof HTMLElement || (typeof value === 'object' && value !== null && (value as Node).nodeType === Node.ELEMENT_NODE);
}

/**
 * Selects an element using the provided CSS selector.
 * 使用提供的 CSS 选择器选择元素
 * @param selector - The CSS selector to use
 *                   要使用的 CSS 选择器
 * @param parent - The parent element to search within (default: document)
 *                 要在其中搜索的父元素（默认：document）
 * @returns The selected element or null if not found
 *          选中的元素，如果未找到则返回 null
 */
export function select(selector: string, parent: Document | HTMLElement = document): HTMLElement | null {
  return parent.querySelector(selector);
}

/**
 * Adds CSS styles to an element.
 * 向元素添加 CSS 样式
 * @param element - The element to add styles to
 *                  要添加样式的元素
 * @param styles - The styles to apply
 *                 要应用的样式
 */
export function addCss(element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
  Object.keys(styles).forEach((key) => {
    const value = styles[key as keyof CSSStyleDeclaration];
    if (value != null) {
      (element.style as any)[key] = value;
    }
  });
}

/**
 * Finds the index of an element among its siblings with the same tag name.
 * 查找元素在其同级元素中相同标签名的索引
 * @param element - The element to find the index for
 *                  要查找索引的元素
 * @param tag - The tag name to count
 *              要计数的标签名
 * @returns The index of the element among its siblings with the same tag
 *          元素在其同级相同标签中的索引
 */
export function findTagIndex(element: HTMLElement, tag: string): number {
  let nth = 0;
  let el: HTMLElement | null = element;
  const t = tag.toLowerCase();

  while (el) {
    if (el.nodeName.toLowerCase() === t) nth += 1;
    el = el.previousElementSibling as HTMLElement | null;
  }
  return nth;
}

/**
 * Finds the absolute position of an element, including cross-frame calculations.
 * 查找元素的绝对位置，包括跨框架计算
 * @param element - The element to find the position for
 *                  要查找位置的元素
 * @returns An object with x and y coordinates
 *          包含 x 和 y 坐标的对象
 */

export function findPosition(element: HTMLElement): { x: number; y: number } {
  const cs = getComputedStyle(element);
  const rect = element.getBoundingClientRect();

  let x = rect.left - parseFloat(cs.marginLeft);
  let y = rect.top - parseFloat(cs.marginTop);

  let win = element.ownerDocument.defaultView;

  while (win && win.frameElement && win.parent !== win) {
    const frameEl = win.frameElement as HTMLElement;
    const frameCS = getComputedStyle(frameEl);
    const frameRect = frameEl.getBoundingClientRect();
    x += frameRect.left - parseFloat(frameCS.marginLeft);
    y += frameRect.top - parseFloat(frameCS.marginTop);
    win = win.parent as (Window & typeof globalThis) | null;
  }

  return { x, y };
}

/**
 * Gets the size and positioning details of an element.
 * 获取元素的尺寸和定位详细信息
 * @param element - The element to get size information for
 *                  要获取尺寸信息的元素
 * @returns An object containing size and positioning details
 *          包含尺寸和定位详细信息的对象
 */

export function getElementSize(element: HTMLElement) {
  if (!element) {
    warn('Element is null or undefined.');
    return null;
  }

  const cs = getComputedStyle(element);
  const pos = findPosition(element);

  const num = (v: string) => parseFloat(v) || 0;

  const border = {
    top: num(cs.borderTopWidth),
    right: num(cs.borderRightWidth),
    bottom: num(cs.borderBottomWidth),
    left: num(cs.borderLeftWidth),
  };

  const padding = {
    top: num(cs.paddingTop),
    right: num(cs.paddingRight),
    bottom: num(cs.paddingBottom),
    left: num(cs.paddingLeft),
  };

  const margin = {
    top: num(cs.marginTop),
    right: num(cs.marginRight),
    bottom: num(cs.marginBottom),
    left: num(cs.marginLeft),
  };

  const borderBoxWidth = element.offsetWidth;
  const borderBoxHeight = element.offsetHeight;

  const contentWidth = borderBoxWidth - border.left - border.right - padding.left - padding.right;
  const contentHeight = borderBoxHeight - border.top - border.bottom - padding.top - padding.bottom;

  return {
    x: pos.x,
    y: pos.y,
    contentWidth,
    contentHeight,
    padding,
    border,
    margin,
    borderBoxWidth,
    borderBoxHeight,
    zIndex: cs.zIndex === 'auto' ? null : Number(cs.zIndex),
    boxSizing: cs.boxSizing,
  };
}

/**
 * Gets the maximum z-index value among all elements in the document.
 * 获取文档中所有元素的最大 z-index 值
 * @returns The maximum z-index value
 *          最大 z-index 值
 */
export function getMaxZIndex(): number {
  let max = 0;
  document.querySelectorAll<HTMLElement>('*').forEach((el) => {
    const z = Number(getComputedStyle(el).zIndex);
    if (!Number.isNaN(z)) max = Math.max(max, z);
  });
  return max;
}

/**
 * Creates an HTML element with the specified tag and attributes.
 * 创建具有指定标签和属性的 HTML 元素
 * @param tag - The tag name for the element
 *              元素的标签名
 * @param attr - An object containing attributes to set
 *               要设置的属性对象
 * @param content - Optional content to insert into the element
 *                  要插入元素的可选内容
 * @returns The created HTML element
 *          创建的 HTML 元素
 */
export function createElement(tag: string, attr: Record<string, string>, content?: string): HTMLElement {
  const el = document.createElement(tag);
  Object.keys(attr).forEach((key) => el.setAttribute(key, attr[key]));
  if (content) el.innerHTML = content;
  return el;
}

/**
 * Creates a surrounding element as a child of the specified parent.
 * 创建一个作为指定父元素子元素的包围元素
 * @param parent - The parent element to append to
 *                 要追加到的父元素
 * @param className - The class name for the new element
 *                    新元素的类名
 * @param content - Optional content to insert into the element
 *                  要插入元素的可选内容
 * @returns The created div element
 *          创建的 div 元素
 */
export function createSurroundElement(parent: HTMLElement, className: string, content?: string): HTMLDivElement {
  const el = createElement('div', { class: className }, content);
  parent.appendChild(el);
  return el as HTMLDivElement;
}
