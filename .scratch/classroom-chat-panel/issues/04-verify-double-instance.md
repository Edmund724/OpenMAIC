# T1：验证双实例会话状态竞争是否真实触发

Type: task
Status: resolved
Blocked by: —

## Question

不是决策，是必须先拿到的事实。

`components/scene-renderers/InteractiveIframeHost.tsx` 也会渲染 `PlaybackChromeRoot`，于是同一个 stage 可能出现**两个 `useChatSessions` 实例**；两者共享 `useStageStore.chats`（`lib/store/stage.ts:290`）但 React state 各自独立，存在后写覆盖先写的风险。`reports/chat-tab-optimization.md` D1 记了这条，但标注"先写复现测试确认"。

**为什么它挡着决策**：新的历史列表要引入"当前选中的是哪段对话"。如果双实例竞争真实存在，这个选择就不可信（另一实例会把它盖掉），那就得先把会话状态整个下沉到 zustand（`use-chat-sessions.ts` 两千多行，代价不小）；如果证伪，就不必付这个重构代价。

要做的事：写一个**能复现或证伪的测试**（单元或 e2e 均可），覆盖两个实例同时存在的场景（含互动组件 iframe 的课堂），观察 `useStageStore.chats` 是否被互相覆盖。产出：结论 + 复现步骤 + 测试文件路径 + 证据（失败输出或断言）。

## Answer

**结论：D1 的前提不成立——`InteractiveIframeHost` 并不渲染 `PlaybackChromeRoot`，"同一 stage 有两个 `useChatSessions` 实例"在当前代码里没有可达路径。但竞争机制是真的：一旦真有第二个实例，后写者会把先写者的会话从持久化列表里抹掉。**

### 1. 前提错在哪

D1 说 `components/scene-renderers/InteractiveIframeHost.tsx` 也会渲染 `PlaybackChromeRoot`。该文件全文只有一处提到这个名字，是 iframe pool 的 doc 注释（`InteractiveIframeHost.tsx:124`："…so the iframe elements it renders survive Pro mode toggles, scene switches, and any PlaybackChromeRoot remount"）——把一句话读成了渲染。反向依赖也只是类型：`PlaybackChromeRoot.tsx:59-62` 用 `import type` 取它的两个类型。

### 2. 单实例的挂载链

`app/classroom/[id]/page.tsx:9` 或 `components/workbench/workspace/WorkspaceClassroomPane.tsx:168`（`WorkspaceShell.tsx:1082-1083` 的 `panes.courseId ?` 保证至多一个 pane）→ `ClassroomSurface.tsx:571` `<Stage>` → `stage.tsx:355` `<PlaybackChromeRoot>`（只有 playback 分支挂；edit 分支不挂 ChatArea）→ `PlaybackChromeRoot.tsx:1886` `<ChatArea>` → `chat-area.tsx:138` `useChatSessions({...})`。`stage.tsx:398` 的 `<InteractiveIframeHost>` 在 `</AnimatePresence>` 之后，是 chrome 的兄弟节点，只渲染 iframe pool。

### 3. 机制：真出现第二个实例时会发生什么

- **共享**：`useStageStore` 的 `chats`（`lib/store/stage.ts:290`）与 `setChats`（`:704`）。注意 `chats` 只在 `getState()` 里读，**不是订阅**。
- **各自独立**：`sessions`（`use-chat-sessions.ts:559`，挂载时从 `getState().chats` 播种一次 `:561`，此后再不订阅）、`activeSessionId`（`:564`）、`expandedSessionIds`（`:565`）、`isStreaming`（`:566`）。
- **写回**：`:626-630` 每次 `sessions` 变化就 `setChats(sessions)`——**整体替换、无合并**；守卫只有 `stageIdRef`，能挡跨 stage 的旧实例，挡不住同 stage 的两个实例。
- **探针实测**（jsdom，挂两个真 `ChatArea` 对同一个真 store）：A 建会话 → store `[seed, A]`、B 的视图仍是 `[seed]`；B 再建会话 → store `[seed, B]`、**A 的会话从 store（即持久化源）消失**，而 A 的界面还在显示它；选择状态不跨实例（A 的 `getActiveSessionType() === 'qa'` 时 B 仍是 `null`）。

### 4. 证据

- `tests/chat/chat-session-mount-graph.test.ts`（10 条）：把产品 import/JSX 图钉成"每 stage 一个 owner"，任何新增的第二个 `<ChatArea>` / `<PlaybackChromeRoot>` 挂载点都会让它变红（用一次性探针文件验证过它确实会红，探针已删）。
- `tests/chat/chat-session-double-instance-hazard.test.ts`（3 条，jsdom 双实例复现）：**断言极性是反的**——它们描述危险机制，绿＝机制成立；将来若真把会话状态下沉到 zustand，它们会变红，那是"重构落地了"的信号。文件头写明了这一点。
- 运行：`pnpm exec vitest run tests/chat/chat-session-mount-graph.test.ts tests/chat/chat-session-double-instance-hazard.test.ts` → 2 files / 13 tests passed。`npx tsc --noEmit` exit 0，`pnpm lint` 0 error。
- 全量 `pnpm test` 有既有失败套件（`tests/runtime/chat-storage.test.ts`、`tests/quiz/runtime.test.ts`、`tests/media/server-backed-media-orchestrator.test.ts`、`tests/workbench/workspace-rail-session-rename.test.ts`，5s 超时类，单独跑也失败）——与本票无关，但规格里"`pnpm test` 必须过"这条要按"没有新增失败"写。
- 产品代码零改动。

### 5. 反证与边界

- 静态扫描只覆盖 `app/ components/ lib/ eval/` 的字面量 import 与 JSX；变量拼出的动态 import、仓库外新建的 React root 扫不到。这是守卫的边界，不是结论的边界。
- 没跑 e2e：挂载图与场景类型无关，`Stage` 恒定渲染这两个组件，互动场景只改变 iframe pool 的 entries。代价是排除不了"运行时某个框架机制造成双挂载"，当前仓库无此类用法。
- 探针直接挂两个 `ChatArea`，没走完整 `Stage`/`PlaybackChromeRoot` 外壳，也没跑引擎/SSE：只证明了列表级覆盖与丢失，没测"流式进行中被另一实例写入"的行为。
- 相邻共享写没测：两实例还会同时写 `useSettingsStore.chatAreaWidth/chatAreaCollapsed`（`PlaybackChromeRoot.tsx:180-182`）、都会注册 `document` 的 visibilitychange 软关闭协调（`use-chat-sessions.ts:805-817`），同类但量级更小。

### 6. 对下游的影响

- **不必把会话状态下沉到 zustand**：触发前提不存在，`activeSessionId` 这类"当前选中哪段"只要仍只有一个 `ChatArea` 实例就成立；P1 定的"历史是浮层、底下对话常驻"正好是单实例形态。G2 可以按"状态仍留在 hook 里"往下走。
- 想留后路有第三条路（比全量下沉便宜得多，真需要时再做）：写回效果只允许 owner 执行，secondary 实例改为订阅 `useStageStore.chats` 只读镜像。全量下沉的条件是"两个 host 都要写"。
- **本票重开条件**：`app/` 或 `components/` 新增第二个 `<ChatArea>`/`<PlaybackChromeRoot>` 挂载点（mount-graph 测试会红），或把课堂挂进第二个 React root / 新窗口（当前扫描覆盖不到，需扩测）。
- 真正躲不掉的同类问题是**跨标签页**：同一课堂开两个标签，两个 JS 上下文各持一份 `chats`，写回 IndexedDB 就是后写覆盖先写。它不是 D1 那条，zustand 也修不了，已登记进地图的范围外。
