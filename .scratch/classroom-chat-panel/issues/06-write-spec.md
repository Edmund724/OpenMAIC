# S1：撰写实现级设计规格

Type: task
Status: open
Blocked by: 02, 03, 05

## Question

本 effort 的终点。把前面所有决策 + 原型确认过的观感，写成一份**可以直接照着改代码**的规格，落到 `reports/`（文件名由用户定）。

规格必须包含：

- **改哪些文件**：`components/chat/`（新输入区组件、列表屏、两屏切换）、`components/roundtable/index.tsx`（撤掉输入面板与右栏学生控件）、`components/edit/PlaybackChromeRoot.tsx`（把 `onMessageSend` / `onInputActivate` / `onUserInputActivity` 从 Roundtable 挪到面板输入区）、`components/chat/use-chat-sessions.ts`（续写已结束会话的状态机、标题生成）、i18n 12 个语言文件。
- **每个改动点的前后结构**，细到组件边界与 props。
- **横条与 192px 常量的联动改法**（`PlaybackChromeRoot.tsx:1595` + `roundtable/index.tsx:1141`）。
- **跟随改的测试**：`e2e/tests/classroom-interaction.spec.ts:165`、`tests/components/edit/playback-chrome-root-element-reference-owner.test.ts`，以及建议新增的测试。
- **不做的事**（把地图的 Out of scope 抄进规格，避免实现时蔓延）。
- **验证方式**：`pnpm lint` / `npx tsc --noEmit` / `pnpm test` / `pnpm check:i18n-keys` / `pnpm test:e2e`。

HITL：规格完成后需用户确认才算达成终点。

## Answer

（待用户确认后才算达成终点）

- 2026-09-22 规格初稿已产出：`reports/classroom-chat-panel-spec.md`——13 节：模块与接缝 / 新增模块（composer、历史浮层、`display-session.ts` 深模块、两个纯函数）/ `use-chat-sessions` 与 `chat-area`、`PlaybackChromeRoot`、`roundtable` 的改造点（带 file:line）/ 快捷键 / i18n 新键 / 跟随改与新增的测试 / 不做的事 / 验证方式 / 落地顺序。
- 待确认时一并看的两处：规格里标注"原型没画过的两个画面"（输入区上方状态条、"有新内容 ↓"）尚未在原型里补看；全屏黑框宽度取了原型值 268px。
