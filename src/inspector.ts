import { addCss, createElement, createSurroundElement, getElementSize, getMaxZIndex, select } from './dom';
import { warn } from './log';
import { throttle } from './throttle';
import { getDom, getXpath } from './xpath';

/**
 * Options for configuring the DomInspector
 * 配置 DomInspector 的选项
 */
export interface DomInspectorOptions {
  root?: HTMLElement;
  theme: string;
  selected?: string[];
  onClick?: (payload: InspectorClickPayload) => void;
}

export interface InspectorClickPayload {
  tag: string;
  xpath: string | null;
  element: HTMLElement;
  event: MouseEvent;
}

/**
 * Overlay type definition for DomInspector
 * DomInspector 的覆盖层类型定义
 */
type Overlay = {
  id: string;
  parent: HTMLDivElement;
  content: HTMLDivElement;
  paddingTop: HTMLDivElement;
  paddingRight: HTMLDivElement;
  paddingBottom: HTMLDivElement;
  paddingLeft: HTMLDivElement;
  borderTop: HTMLDivElement;
  borderRight: HTMLDivElement;
  borderBottom: HTMLDivElement;
  borderLeft: HTMLDivElement;
  marginTop: HTMLDivElement;
  marginRight: HTMLDivElement;
  marginBottom: HTMLDivElement;
  marginLeft: HTMLDivElement;
  tips: HTMLDivElement;
};

const SELECTED_COLORS = ['#4286f4', '#f45d48', '#2fbf71', '#f4c542', '#8e44ad', '#2c98f0'];

/**
 * DomInspector class that provides visual overlay for DOM elements
 * 提供 DOM 元素可视化覆盖的 DomInspector 类
 */
export class DomInspector {
  doc?: HTMLDocument;
  root?: HTMLElement;
  theme: string;
  overlay?: Overlay;
  target?: HTMLElement;
  cachedTarget?: HTMLElement;
  selected?: string[];
  selectedLayer?: HTMLDivElement;
  selectedOutlines: HTMLDivElement[] = [];
  selectedBadges: HTMLDivElement[] = [];
  destroyed: boolean = false;
  maxZIndex: number = 0;
  throttleOnMove: (e: MouseEvent) => void;
  throttleOnClick: (e: MouseEvent) => void;
  onClick?: (payload: InspectorClickPayload) => void;

  /**
   * Creates a new DomInspector instance
   * 创建新的 DomInspector 实例
   * @param options - Configuration options for the inspector
   *                  用于检查器的配置选项
   */
  constructor(options: Partial<DomInspectorOptions>) {
    this.doc = window.document;
    this.root = options?.root || select('body') || undefined;
    this.theme = options?.theme || 'dom-inspector-theme-default';
    this.selected = options?.selected || [];
    this.destroyed = false;
    this.maxZIndex = getMaxZIndex();
    this.onClick = options?.onClick;
    this.throttleOnMove = throttle(this.onMove.bind(this), 100);
    this.throttleOnClick = throttle(this.handleClick.bind(this), 100);
    this.init();
  }

  /**
   * Initializes the inspector overlay
   * 初始化检查器覆盖层
   */
  init() {
    if (!this.root) {
      warn('Root element is not defined.');
      return;
    }

    this.overlay = { id: `dom-inspector-${Date.now()}` } as Overlay;

    const parent = createElement('div', {
      id: this.overlay.id,
      class: `dom-inspector ${this.theme}`,
      style: `z-index: ${this.maxZIndex}`,
    });

    this.overlay = {
      id: this.overlay.id,
      parent: parent as HTMLDivElement,
      content: createSurroundElement(parent, 'content'),
      paddingTop: createSurroundElement(parent, 'padding padding-top'),
      paddingRight: createSurroundElement(parent, 'padding padding-right'),
      paddingBottom: createSurroundElement(parent, 'padding padding-bottom'),
      paddingLeft: createSurroundElement(parent, 'padding padding-left'),
      borderTop: createSurroundElement(parent, 'border border-top'),
      borderRight: createSurroundElement(parent, 'border border-right'),
      borderBottom: createSurroundElement(parent, 'border border-bottom'),
      borderLeft: createSurroundElement(parent, 'border border-left'),
      marginTop: createSurroundElement(parent, 'margin margin-top'),
      marginRight: createSurroundElement(parent, 'margin margin-right'),
      marginBottom: createSurroundElement(parent, 'margin margin-bottom'),
      marginLeft: createSurroundElement(parent, 'margin margin-left'),
      tips: createSurroundElement(
        parent,
        'tips',
        '<div class="tag"></div><div class="id"></div><div class="class"></div><div class="line">&nbsp;|&nbsp;</div><div class="size"></div><div class="triangle"></div>'
      ),
    };
    this.root.appendChild(parent);
  }

  /**
   * Handles click events to trigger actions
   * 处理点击事件以触发操作
   * @param args - Arguments from the click event
   *               点击事件的参数
   */
  handleClick(event: MouseEvent): void {
    if (!this.onClick) return;
    const element = (event?.target as HTMLElement) || this.target;
    if (!element) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    this.onClick({
      tag: element.tagName?.toLowerCase() || '',
      xpath: this.getXPath(element),
      element,
      event,
    });
  }

  /**
   * Handles mouse movement to update the overlay
   * 处理鼠标移动以更新覆盖层
   * @param args - Arguments from the mouse event
   *               鼠标事件的参数
   */
  onMove(...args: unknown[]): void {
    const e: MouseEvent = args[0] as MouseEvent;
    this.target = e.target as HTMLElement;
    if (this.target === this.cachedTarget) return;
    this.cachedTarget = this.target;
    const elementSize = getElementSize(e.target as HTMLElement);
    if (!elementSize) return;

    const contentWidth = elementSize.contentWidth ?? elementSize.borderBoxWidth - elementSize.border.left - elementSize.border.right - elementSize.padding.left - elementSize.padding.right;
    const contentHeight = elementSize.contentHeight ?? elementSize.borderBoxHeight - elementSize.border.top - elementSize.border.bottom - elementSize.padding.top - elementSize.padding.bottom;

    const contentLevel = {
      width: contentWidth,
      height: contentHeight,
    };
    const paddingLevel = {
      width: elementSize.padding.left + contentLevel.width + elementSize.padding.right,
      height: elementSize.padding.top + contentLevel.height + elementSize.padding.bottom,
    };
    const borderLevel = {
      width: elementSize.border.left + paddingLevel.width + elementSize.border.right,
      height: elementSize.border.top + paddingLevel.height + elementSize.border.bottom,
    };
    const marginLevel = {
      width: (elementSize.margin.left ?? 0) + borderLevel.width + (elementSize.margin.right ?? 0),
      height: (elementSize.margin.top ?? 0) + borderLevel.height + (elementSize.margin.bottom ?? 0),
    };

    addCss(this.overlay!.parent, {
      width: `${marginLevel.width}px`,
      height: `${marginLevel.height}px`,
      top: `${elementSize.y}px`,
      left: `${elementSize.x}px`,
    });

    addCss(this.overlay!.content, {
      width: `${contentLevel.width}px`,
      height: `${contentLevel.height}px`,
      top: `${(elementSize.margin.top ?? 0) + elementSize.border.top + elementSize.padding.top}px`,
      left: `${(elementSize.margin.left ?? 0) + elementSize.border.left + elementSize.padding.left}px`,
    });

    addCss(this.overlay!.paddingTop, {
      width: `${paddingLevel.width}px`,
      height: `${elementSize.padding.top}px`,
      top: `${(elementSize.margin.top ?? 0) + elementSize.border.top}px`,
      left: `${(elementSize.margin.left ?? 0) + elementSize.border.left}px`,
    });

    addCss(this.overlay!.paddingRight, {
      width: `${elementSize.padding.right}px`,
      height: `${paddingLevel.height - elementSize.padding.top}px`,
      top: `${elementSize.padding.top + (elementSize.margin.top ?? 0) + elementSize.border.top}px`,
      right: `${(elementSize.margin.right ?? 0) + elementSize.border.right}px`,
    });

    addCss(this.overlay!.paddingBottom, {
      width: `${paddingLevel.width - elementSize.padding.right}px`,
      height: `${elementSize.padding.bottom}px`,
      bottom: `${(elementSize.margin.bottom ?? 0) + elementSize.border.bottom}px`,
      right: `${elementSize.padding.right + (elementSize.margin.right ?? 0) + elementSize.border.right}px`,
    });

    addCss(this.overlay!.paddingLeft, {
      width: `${elementSize.padding.left}px`,
      height: `${paddingLevel.height - elementSize.padding.top - elementSize.padding.bottom}px`,
      top: `${elementSize.padding.top + (elementSize.margin.top ?? 0) + elementSize.border.top}px`,
      left: `${(elementSize.margin.left ?? 0) + elementSize.border.left}px`,
    });

    addCss(this.overlay!.borderTop, {
      width: `${borderLevel.width}px`,
      height: `${elementSize.border.top}px`,
      top: `${elementSize.margin.top ?? 0}px`,
      left: `${elementSize.margin.left ?? 0}px`,
    });

    addCss(this.overlay!.borderRight, {
      width: `${elementSize.border.right}px`,
      height: `${borderLevel.height - elementSize.border.top}px`,
      top: `${(elementSize.margin.top ?? 0) + elementSize.border.top}px`,
      right: `${elementSize.margin.right ?? 0}px`,
    });

    addCss(this.overlay!.borderBottom, {
      width: `${borderLevel.width - elementSize.border.right}px`,
      height: `${elementSize.border.bottom}px`,
      bottom: `${elementSize.margin.bottom ?? 0}px`,
      right: `${(elementSize.margin.right ?? 0) + elementSize.border.right}px`,
    });

    addCss(this.overlay!.borderLeft, {
      width: `${elementSize.border.left}px`,
      height: `${borderLevel.height - elementSize.border.top - elementSize.border.bottom}px`,
      top: `${(elementSize.margin.top ?? 0) + elementSize.border.top}px`,
      left: `${elementSize.margin.left ?? 0}px`,
    });

    addCss(this.overlay!.marginTop, {
      width: `${marginLevel.width}px`,
      height: `${elementSize.margin.top ?? 0}px`,
      top: '0px',
      left: '0px',
    });

    addCss(this.overlay!.marginRight, {
      width: `${elementSize.margin.right ?? 0}px`,
      height: `${marginLevel.height - (elementSize.margin.top ?? 0)}px`,
      top: `${elementSize.margin.top ?? 0}px`,
      right: '0px',
    });

    addCss(this.overlay!.marginBottom, {
      width: `${marginLevel.width - (elementSize.margin.right ?? 0)}px`,
      height: `${elementSize.margin.bottom ?? 0}px`,
      bottom: '0px',
      right: `${elementSize.margin.right ?? 0}px`,
    });

    addCss(this.overlay!.marginLeft, {
      width: `${elementSize.margin.left ?? 0}px`,
      height: `${marginLevel.height - (elementSize.margin.top ?? 0) - (elementSize.margin.bottom ?? 0)}px`,
      top: `${elementSize.margin.top ?? 0}px`,
      left: '0px',
    });

    const tagEl = select('.tag', this.overlay!.tips);
    if (tagEl) tagEl.innerHTML = this.target!.tagName.toLowerCase();
    const idEl = select('.id', this.overlay!.tips);
    if (idEl) idEl.innerHTML = this.target!.id ? `#${this.target!.id}` : '';
    const classEl = select('.class', this.overlay!.tips);
    if (classEl)
      classEl.innerHTML = Array.from(this.target!.classList)
        .map((item) => `.${item}`)
        .join('');
    const sizeEl = select('.size', this.overlay!.tips);
    if (sizeEl) sizeEl.innerHTML = `${marginLevel.width}x${marginLevel.height}`;

    let tipsTop = 0;
    if (elementSize.y >= 24 + 8) {
      this.overlay!.tips.classList.remove('reverse');
      tipsTop = elementSize.y - 24 - 8;
    } else {
      this.overlay!.tips.classList.add('reverse');
      tipsTop = marginLevel.height + elementSize.y + 8;
    }
    addCss(this.overlay!.tips, {
      top: `${tipsTop}px`,
      left: `${elementSize.x}px`,
      display: 'block',
    });
  }

  /**
   * Enables the inspector overlay
   * 启用检查器覆盖层
   */
  enable(): void {
    if (this.destroyed) {
      warn('DomInspector has been destroyed and cannot be enabled again.');
      return;
    }
    if (!this.overlay) {
      warn('Overlay is not initialized.');
      return;
    }
    if (!this.overlay.parent) {
      warn('Overlay parent is missing.');
      return;
    }
    if (!this.root) {
      warn('Root element is not defined.');
      return;
    }
    this.overlay.parent.style.display = 'block';
    this.root.addEventListener('mousemove', this.throttleOnMove);
    if (this.onClick) this.root.addEventListener('click', this.throttleOnClick);
  }

  /**
   * Disables the inspector overlay
   * 禁用检查器覆盖层
   */
  disable(): void {
    if (!this.overlay) {
      warn('Overlay is not initialized.');
      return;
    }
    if (!this.overlay.parent) {
      warn('Overlay parent is missing.');
      return;
    }
    if (!this.root) {
      warn('Root element is not defined.');
      return;
    }
    this.overlay.parent.style.display = 'none';
    this.target = undefined;
    this.cachedTarget = undefined;
    this.root.removeEventListener('mousemove', this.throttleOnMove);
    if (this.onClick) this.root.removeEventListener('click', this.throttleOnClick);
  }

  /**
   * Gets the XPath for the specified element
   * 获取指定元素的 XPath
   * @param element - The element to get the XPath for
   *                  要获取 XPath 的元素
   * @returns The XPath string or null if not found
   *          XPath 字符串，如果未找到则返回 null
   */
  getXPath(element: HTMLElement): string | null {
    if (!element) {
      warn('getXPath: element is missing.');
      return null;
    }
    return getXpath(element);
  }

  enableSelected(): void {
    if (!this.selected || this.selected.length === 0) return;
    if (this.destroyed) {
      warn('DomInspector has been destroyed and cannot enable selected markers.');
      return;
    }

    this.disableSelected();

    const parent = this.root || this.doc?.body;
    if (!parent) {
      warn('enableSelected: root element is not defined.');
      return;
    }

    this.selectedLayer = createElement('div', {
      class: `dom-inspector-selected-layer ${this.theme}`,
      style: `position: fixed; top: 0; left: 0; pointer-events: none; z-index: ${this.maxZIndex + 2};`,
    }) as HTMLDivElement;
    parent.appendChild(this.selectedLayer);

    this.selected.forEach((xpath, index) => {
      const element = getDom(xpath, parent);
      if (!element) {
        warn(`enableSelected: element not found for xpath "${xpath}".`);
        return;
      }

      const size = getElementSize(element);
      if (!size) return;

      const colorIndex = index % SELECTED_COLORS.length;

      const outline = createElement('div', {
        class: 'dom-inspector-selected-outline',
        'data-xpath': xpath,
      }) as HTMLDivElement;

      outline.classList.add(`color-${colorIndex}`);

      const outlineTop = size.y + (size.margin.top ?? 0);
      const outlineLeft = size.x + (size.margin.left ?? 0);

      addCss(outline, {
        top: `${outlineTop}px`,
        left: `${outlineLeft}px`,
        width: `${size.borderBoxWidth}px`,
        height: `${size.borderBoxHeight}px`,
      });

      const badge = createElement('div', {
        class: 'dom-inspector-selected-badge',
        'data-xpath': xpath,
      }) as HTMLDivElement;

      badge.textContent = String(index + 1);
      badge.classList.add(`color-${colorIndex}`);
      outline.appendChild(badge);

      this.selectedLayer!.appendChild(outline);
      this.selectedOutlines.push(outline);
      this.selectedBadges.push(badge);
    });
  }

  disableSelected(): void {
    this.selectedOutlines.forEach((outline) => outline.remove());
    this.selectedOutlines = [];
    this.selectedBadges.forEach((badge) => badge.remove());
    this.selectedBadges = [];

    if (this.selectedLayer) {
      this.selectedLayer.innerHTML = '';
      if (this.selectedLayer.parentElement) {
        this.selectedLayer.parentElement.removeChild(this.selectedLayer);
      }
      this.selectedLayer = undefined;
    }
  }

  /**
   * Destroys the inspector and cleans up resources
   * 销毁检查器并清理资源
   */
  destroy(): void {
    this.disable();
    this.disableSelected();
    this.overlay = undefined;
    this.destroyed = true;
  }
}
