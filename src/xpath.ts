import { findTagIndex, isDom } from './dom';
import { warn } from './log';

/**
 * Returns an absolute XPath using only tag names and positional indexes.
 * 仅使用标签和序号返回绝对 XPath。
 */
export function getXpath(element: HTMLElement): string | null {
  if (!isDom(element)) {
    warn('getXpath: target is not an element.');
    return null;
  }

  const segments: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current.nodeType === Node.ELEMENT_NODE) {
    const tag = current.tagName.toLowerCase();
    const index = findTagIndex(current, tag);
    // Always include index to keep the path deterministic.
    segments.unshift(`${tag}[${index}]`);
    current = current.parentElement;
  }

  return `/${segments.join('/')}`;
}

/**
 * Resolves an absolute XPath back to a DOM element.
 * 根据绝对 XPath 查找元素。
 */
export function getDom(xpath: string, root: Document | Element = document): HTMLElement | null {
  if (!xpath) {
    warn('getDom: xpath is empty.');
    return null;
  }

  const doc = root instanceof Document ? root : root.ownerDocument || document;
  const contextNode = root instanceof Document ? root : root;
  const result = doc.evaluate(xpath, contextNode, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
  const node = result.singleNodeValue;
  return node instanceof HTMLElement ? node : null;
}
