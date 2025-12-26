# DOM Inspector / DOM 检查器

| Info | Badge |
| --- | --- |
| Version | [![version](https://img.shields.io/badge/version-1.0.1-blue.svg)](https://www.npmjs.com/package/dom-inspector) |
| Language | [![typescript](https://img.shields.io/badge/lang-TypeScript-3178c6.svg)](https://www.typescriptlang.org/) |
| Build | [![vite](https://img.shields.io/badge/build-Vite-646cff.svg)](https://vitejs.dev/) |
| Tests | [![tests](https://img.shields.io/badge/tests-Vitest-6e9fef.svg)](https://vitest.dev/) |

Lightweight DOM overlay that visualizes margin, border, padding, and size while giving you XPath and click payloads. 轻量的 DOM 可视化层，展示边距/边框/内边距/尺寸，并返回 XPath 与点击数据。

## Features / 功能
- Visual overlay highlights margin, border, padding, and content box for the hovered element; tooltip shows tag, id, class list, and size.
- Click callback returns tag, XPath, the element itself, and the original mouse event for downstream tooling.
- XPath helpers to build and resolve deterministic absolute paths; DOM helpers include sizing, position (with cross-frame support), and safe element creation.
- `throttle` to keep overlay updates smooth under frequent mousemove; logging helpers for consistent console output.
- Written in TypeScript; ships as ESM/CJS with declaration files for typed projects.

## Install / 安装
```bash
git clone https://github.com/devcui/dom-inspector.git
cd dom-inspector
npm install
npm run build
```

Then import from the local package output (dist includes ESM/CJS and d.ts files). 构建后从本地 dist 中引用即可。

## Usage / 用法
```ts
import { DomInspector } from 'dom-inspector';

const inspector = new DomInspector({
	theme: 'dom-inspector-theme-default',
	onClick: (payload) => {
		console.log('Clicked:', payload.tag, payload.xpath);
	},
});

inspector.enable(); // start overlay
// inspector.disable(); // hide without disposing
// inspector.destroy(); // clean up when done
```

XPath helper alone:
```ts
import { getXpath, getDom } from 'dom-inspector';

const xpath = getXpath(document.querySelector('main')!);
const node = getDom(xpath!);
```

> Styles are imported by the library entry; ensure your bundler includes CSS outputs when packaging. 库入口会引入样式，确保打包流程能输出对应的 CSS。

## API Overview / 接口概览

### DomInspector (class)
- `constructor({ root?, theme, onClick? })`: create overlay; `root` defaults to `document.body`; `onClick` receives `{ tag, xpath, element, event }`.
- `enable()`: show overlay and start listeners.
- `disable()`: hide overlay and remove listeners.
- `destroy()`: disable and mark instance unusable.
- `getXPath(element)`: safe wrapper to compute XPath.

### DOM helpers
- `isDom(value)`: type guard for HTMLElement.
- `select(selector, parent?)`: shorthand for `querySelector`.
- `addCss(element, styles)`: apply inline styles from a partial declaration.
- `findTagIndex(element, tag)`: sibling index for deterministic XPath segments.
- `findPosition(element)`: absolute position with cross-frame offsets.
- `getElementSize(element)`: content, padding, border, margin metrics plus z-index/box-sizing.
- `getMaxZIndex()`: max z-index across document.
- `createElement(tag, attrs, content?)`: HTML element helper.
- `createSurroundElement(parent, className, content?)`: append div with class/content.

### XPath helpers
- `getXpath(element)`: build absolute XPath with tag and positional indexes.
- `getDom(xpath, root?)`: resolve XPath to an HTMLElement (or `null`).

### Utilities
- `throttle(func, wait?)`: throttle a function with trailing execution.
- `mixin(target, source)`: shallow copy own properties from `source` into `target`.
- `isNull(value)`: strict null check.
- `log / warn / error(message, ...args)`: namespaced console output.

## Development / 开发
- `npm run dev`: playground via Vite dev server.
- `npm run build`: type declarations + production build.
- `npm test`: run Vitest; `npm run test:coverage` for coverage.

## License / 许可证
MIT
