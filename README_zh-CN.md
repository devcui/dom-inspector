# DOM Inspector / DOM 检查器

| 信息 | 徽标 |
| --- | --- |
| 版本 | [![version](https://img.shields.io/badge/version-1.0.1-blue.svg)](https://www.npmjs.com/package/dom-inspector) |
| 语言 | [![typescript](https://img.shields.io/badge/lang-TypeScript-3178c6.svg)](https://www.typescriptlang.org/) |
| 构建 | [![vite](https://img.shields.io/badge/build-Vite-646cff.svg)](https://vitejs.dev/) |
| 测试 | [![tests](https://img.shields.io/badge/tests-Vitest-6e9fef.svg)](https://vitest.dev/) |

轻量的 DOM 可视化检查器，悬停时展示元素的 margin / border / padding / content 尺寸，并在点击时返回 XPath、标签等信息，方便在调试或埋点场景中复用。

## 功能特点
- 悬停高亮：可视化 margin、border、padding、content，气泡提示展示标签、id、class 列表和尺寸。
- 点击回调：返回 `{ tag, xpath, element, event }` 便于后续处理。
- XPath 工具：`getXpath` 生成确定性的绝对 XPath，`getDom` 可反解回元素。
- DOM 辅助：获取元素尺寸、跨 iframe 位置、最大 z-index、创建节点等小工具。
- 节流与日志：`throttle` 平滑鼠标移动事件，`log/warn/error` 统一前缀输出。
- TypeScript 编写，提供 ESM/CJS 以及 d.ts 类型声明。

## 安装
```bash
git clone https://github.com/devcui/dom-inspector.git
cd dom-inspector
npm install
npm run build
```

构建后的 dist 目录包含 ESM/CJS 以及类型声明，可直接本地引用。

## 快速上手
```ts
import { DomInspector } from 'dom-inspector';

const inspector = new DomInspector({
	theme: 'dom-inspector-theme-default',
	onClick: (payload) => {
		console.log('点击:', payload.tag, payload.xpath);
	},
});

inspector.enable();
// inspector.disable();
// inspector.destroy();
```

仅使用 XPath 工具：
```ts
import { getXpath, getDom } from 'dom-inspector';

const xpath = getXpath(document.querySelector('main')!);
const node = getDom(xpath!);
```

> 库入口已导入样式，确保打包流程能输出对应 CSS 文件。

## API 概览

### `DomInspector` 类
- `constructor({ root?, theme, onClick? })`：`root` 默认 `document.body`，`onClick` 接收 `{ tag, xpath, element, event }`。
- `enable()`：展示覆盖层并绑定事件。
- `disable()`：隐藏覆盖层并移除事件。
- `destroy()`：销毁实例，释放资源。
- `getXPath(element)`：安全计算 XPath。

### DOM 工具
- `isDom(value)`、`select(selector, parent?)`、`addCss(element, styles)`
- `findTagIndex(element, tag)`、`findPosition(element)`、`getElementSize(element)`
- `getMaxZIndex()`、`createElement(tag, attrs, content?)`、`createSurroundElement(parent, className, content?)`

### XPath 工具
- `getXpath(element)`：生成绝对 XPath。
- `getDom(xpath, root?)`：根据 XPath 返回 HTMLElement 或 null。

### 其他
- `throttle(func, wait?)`：函数节流。
- `mixin(target, source)`：浅层属性混入。
- `isNull(value)`：严格 null 判断。
- `log / warn / error(message, ...args)`：带前缀的控制台输出。

## 开发脚本
- `npm run dev`：Vite 本地预览。
- `npm run build`：类型声明 + 生产构建。
- `npm test`：Vitest 单测；`npm run test:coverage` 输出覆盖率。

## 许可证
MIT
