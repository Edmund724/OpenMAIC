# T1：验证双实例会话状态竞争是否真实触发

Type: task
Status: open
Blocked by: —

## Question

不是决策，是必须先拿到的事实。

`components/scene-renderers/InteractiveIframeHost.tsx` 也会渲染 `PlaybackChromeRoot`，于是同一个 stage 可能出现**两个 `useChatSessions` 实例**；两者共享 `useStageStore.chats`（`lib/store/stage.ts:290`）但 React state 各自独立，存在后写覆盖先写的风险。`reports/chat-tab-optimization.md` D1 记了这条，但标注"先写复现测试确认"。

**为什么它挡着决策**：新的历史列表要引入"当前选中的是哪段对话"。如果双实例竞争真实存在，这个选择就不可信（另一实例会把它盖掉），那就得先把会话状态整个下沉到 zustand（`use-chat-sessions.ts` 两千多行，代价不小）；如果证伪，就不必付这个重构代价。

要做的事：写一个**能复现或证伪的测试**（单元或 e2e 均可），覆盖两个实例同时存在的场景（含互动组件 iframe 的课堂），观察 `useStageStore.chats` 是否被互相覆盖。产出：结论 + 复现步骤 + 测试文件路径 + 证据（失败输出或断言）。

## Answer

（待解）
