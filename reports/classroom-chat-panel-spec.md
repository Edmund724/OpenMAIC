# 课堂对话面板改版 · 实现级规格

依据：`.scratch/classroom-chat-panel/map.md` 与六张票（R1 调研 / P1 原型 / G1 边界 / T1 双实例 / G2 存放 / S1 本文件）。
范围：**纯前端**。后端与存储层格式（会话怎么落盘）都不改；lecture 会话不进列表；不做隐藏、不做删除。
状态：待用户确认（S1 由用户确认后才算达成终点）。

## 1. 一句话

把学生发言入口从左下角横条搬进右侧"对话"tab 底部（常驻输入区）；横条只撤掉**学生自己的**控件（学生 agent 头像条保留）；全屏讲课时输入条住进**右侧黑框**；历史与"当前对话"按对话列表的心智重做。

## 2. 模块与接缝

| 关注点 | 归属 | 谁能改 |
|---|---|---|
| 学生发言的引擎语义（打断、TTS、soft-close、thinking、切 tab） | `PlaybackChromeRoot.onMessageSend` 闭包（`:1740-1795`），**原地不动** | 只有它自己 |
| 输入态（草稿、录音、焦点、可发/不可发） | 新 composer 组件内部 + 宿主按会话存的草稿表 | composer |
| "学生正在看哪段"（`displaySessionId`） | `useChatSessions`（唯一事实源） | hook |
| 未读 | `useChatSessions` 内部推导 | hook |
| 按 stage 的 device 状态（显示指针） | 深模块 `lib/chat/display-session.ts` | 该模块 |
| 舞台侧对话可视化（3 秒气泡、讨论邀请卡） | `roundtable/`，**保留** | 不动 |

四条取舍（本规格的理由）：
1. `onMessageSend` 的 11 个副作用一条都不下放——composer 只负责"把学生打的字交上去"（`sendMessageWithElementReference:302-327` 同理不动）。
2. 输入态随 composer 走，宿主只给草稿初值与回调；换会话不换组件实例。
3. 未读是 hook 的**派生结论**，不是让调用方算的指标。
4. 只为一个真实的变体开接缝：composer 有 `panel | fullscreen` 两种形态（这是它唯一的形态参数）；device 存储只为"能注入 KV 测试"开一个 `{ kv? }` 参数，照 `lib/document-store/current-scene.ts:20-25` 的写法。

## 3. 新增模块

### 3.1 `components/chat/composer.tsx` —— 输入区（两处渲染）

接口：

```ts
export type ComposerVariant = 'panel' | 'fullscreen'; // panel = 对话 tab 底部；fullscreen = 黑框窄栏
export interface ComposerProps {
  variant: ComposerVariant;
  value: string;                                  // 草稿，由宿主按 displaySessionId 提供
  onValueChange: (next: string) => void;
  onSubmit: (text: string) => void;               // 只交字，不管引擎
  onInputActivate?: () => void;                   // 聚焦 / 开始输入 → 一级暂停（沿用现语义）
  onUserInputActivity?: () => void;               // 键入 / 开录 → 续 soft-closing
  onActivityChange?: (active: boolean) => void;   // "输入 UI 在使用"，喂 onPresentationInteractionChange
  isCueUser?: boolean;                            // 轮到你了：琥珀描边 + 上方提示条
  disabled?: boolean;                             // 正在处理（面板形态：isStreaming）→ 禁发送
  elementReferencePill?: ReactNode;               // 现有引用 pill（展示）
  onClearElementReference?: () => void;
}
```

调用方必须知道的行为（不变量）：
- 提交只走 `onSubmit`；**清空草稿由宿主决定**，composer 不自己清。
- Enter 提交、Shift+Enter 换行、**组合输入（IME）中不提交**。
- **录音结果写进 `value`（`onValueChange`），不自动提交**——这是与今天唯一的行为差异（今天 `roundtable/index.tsx:380-396` 识别完直接发送）。
- `variant === 'fullscreen'` 时按钮收成图标、不显示标签。
- 录音态（波形 + 实时文字 + 取消/完成）、文本域自适应高度（上限沿用 `NON_PRESENTATION_INPUT_MAX_HEIGHT_PX`，`index.tsx:116`）都是实现细节，不进接口。
- placeholder 沿用现键 `roundtable.inputPlaceholder`（文案不变，三个 e2e 的 placeholder 选择器因此仍然有效）。

内部依赖：`components/audio/speech-button.tsx`（`onTranscription` / `disabled` / `size`）或同签名的 `useAudioRecorder`（`lib/hooks/use-audio-recorder.ts:340-347`）+ `asrEnabled`（settings store）。**不要**用 `components/ai-elements/prompt-input.tsx`（零引用，麦克风写死 `en-US`）。
测试锚点：给根节点 `data-testid="chat-composer"`、textarea 一个稳定 testid（跟着改的 e2e 要用）。

### 3.2 `components/chat/history-overlay.tsx` + `lib/chat/session-groups.ts`

- 纯函数先行：`groupSessionsByDay(sessions, now)` → `[{ label: 'today' | 'yesterday' | 'earlier', sessions }]`，按 `createdAt` 倒序。深模块：小接口、全是日期边界规则，用假 `now` 直接测。
- 浮层接口：`{ open, sessions, displaySessionId, onSelect(id), onNew(), onRename(id, title), onClose() }`。
- 行为：点条目 = **只换显示**（关浮层，不结束活跃会话）；改名内联（Enter 保存 / Escape 取消）；**不做**隐藏与删除；浮层**不因引擎动作自动关**。
- 挂点：`chat-area.tsx:295-322` 面板顶部那一行（唯一元素槽），入口按钮放左侧。
- 条目渲染：标题 + 类型徽章 + 状态点，悬停出"改名"；无逐条时间戳（时间只由分组标题表达，精确时间放 `title` 属性兜底）。

### 3.3 `lib/chat/display-session.ts` —— 按 stage 的 device 状态

```ts
export function loadDisplaySession(stageId: string, deps?: { kv?: KVStore }): Promise<string | null>;
export function saveDisplaySession(stageId: string, sessionId: string, deps?: { kv?: KVStore }): Promise<void>;
export function clearDisplaySession(stageId: string, deps?: { kv?: KVStore }): Promise<void>;
```

- 形状照抄 `lib/document-store/current-scene.ts:13-75`：前缀 `display-session:` + stageId；scope **恒为 `'device'`**（默认是 `'account'`，必须显式传，`packages/@openmaic/storage/src/kv/types.ts:58`）；client-only 守卫；坏数据当 `null` 不抛。
- 清理：`lib/utils/stage-storage.ts:631-645` 的 stage 删除级联里加一行 `await clearDisplaySession(stageId)`（同处已有 `clearCursor` / `clearCurrentScene`；守卫测试 `tests/runtime/stage-delete-wiring.test.ts:97-104`）。

### 3.4 两个纯函数

- `deriveSessionTitle(firstUserText: string): string` —— 首句截断（借 `lib/workbench/session-title.ts:20-48` 的 sanitize / 截断形状，不劈开代理对）。
- `pickDisplayFallback(sessions): string | null` —— 指针失效时的兜底：取 `createdAt` 末位（`lib/utils/chat-storage.ts:999-1001` 已是升序）；空数组 → `null`。

## 4. 改造 `components/chat/use-chat-sessions.ts`

接口只加这几样，其余都在内部实现：

```ts
displaySessionId: string | null;
setDisplaySessionId: (id: string | null) => void;   // 学生动作：换显示 + 清未读
unreadSessionIds: ReadonlySet<string>;              // 引擎写过、学生没看的会话
renameSession: (id: string, title: string) => void;
composerDrafts: { get(id: string): string; set(id: string, text: string): void };
```

实现要点：

1. **播种与兜底**：挂载（`:559-566`）与换 stage（`:593-606`）时读 `loadDisplaySession`，校验该会话存在且不是 lecture；失效 → `pickDisplayFallback(sessions)`；空列表 → `null`。**校验放在 `normalizeStoredSessionsForRestore`（`:289-305`）之后**——它会把 active→interrupted、soft-closing→completed。
2. **写穿**：`displaySessionId` 变化（非恢复态）时 `saveDisplaySession`；换 stage 时不要写旧 stage。
3. **续写旧对话 = 复活那一段**：`sendMessage` 的判据点（`:1794-1796`）改为——落点是已 `completed` 的会话时**复用该 `sessionId` 并把 status 改回 `active`**（复用 `withChatSessionStatus`，与 lecture 复活 `:2096-2098` 同形），不再新建；随后仍走 `:1798-1804` 的"先结束其它活跃会话"。`:1903` 会自动带上它的 `directorState`，**不需要新管道**。lecture 那半条特判保留（lecture 永不成为 display）。
4. **未读**：在引擎写入的汇集口标记——`createBufferForSession`（`:905-1127`）里那 4 个 `setSessions`（`:933` / `:968` / `:1011` / `:2181`）。规则：写入的会话 ≠ `displaySessionId` 时把它加进 `unreadSessionIds`；`setDisplaySessionId(id)` 时删掉该 id。不要用 `updatedAt`（`:995-997` 明确不随 tick 更新）。
5. **标题**：三处写死的 `'Q&A'`（`:1804` / `:1811` / `:1861`）改用 `deriveSessionTitle(首句)`；`renameSession` 直接改 `title`（持久化字段已在 `chat-storage-core.ts:30-44`）。
6. **`expandedSessionIds` 随卡片退役**（`:565` 与各写入点、`session-list.tsx:120-141` 的展开体）。
7. `activeSessionId` 保留原语义（引擎 / 学生正在推进的会话），与 `displaySessionId` **不互相赋值**；`getActiveSessionType()` 的消费者（`PlaybackChromeRoot.tsx:1912`）不动。

## 5. 改造 `components/chat/chat-area.tsx`

- 对话 tab 从"卡片列表"改成三段：**常驻消息流 + 状态条 + composer**。
  - 消息流：把 `ChatSessionComponent` 从卡片里提出来，渲染 `displaySession`；无 display → 空对话屏（图标 + "开始一段新对话"，用现键 `chat.startConversation`）。贴底跟随沿用 `chat-session.tsx:182-218` 的 `isAtBottomRef` 判定（距底 < 24px 算贴底）；不贴底时在消息流底部悬浮一枚深色胶囊 **"有新内容 ↓"**（水平居中、离底 12px），点它落到底并恢复跟随，落到底即自行消失（观感以原型 `?new=1` 为准）。
  - 状态条：坐在 **composer 正上方、同一片 footer 内** 的一条细带（浅灰底 + 1px 描边、圆角、高约 24px；左起一枚图标 + 一行小字，右端一枚描边胶囊按钮），有活跃 / soft-closing 会话时出现，三种形态：
    - 活跃：紫点 + "张老师正在回答…" + **停止**（`endSession` + `onStopSession`，现 `:181-200`）
    - soft-closing：对话图标 + "这段讨论还有 12s 结束" + **继续**（`continueSoftClosingSession`，现 `:202-205`）
    - 活跃会话 ≠ display："另一端还有讨论在进行" + **回去**（只换 display，不结束任何会话）
    观感以原型 `?bar=stop|continue|other` 为准（`components/prototype/classroom-chat/status-bar.tsx`）。
  - 旧的会话卡片末尾那对按钮（`chat-session.tsx:353-384`）随之删掉，"已结束"分隔条（`:330-347`）保留为状态展示。
- 顶部行加历史入口按钮，浮层从这里盖下来。
- 未读点：`hasActiveChatSession`（`:163-166`）换成 `unreadSessionIds.size > 0 || isCueUser`；显示条件（今天只在笔记 tab 时显示，`:305`）不变。
- 新增 props：`onComposerSubmit`、`onComposerActivity`、`elementReferencePill`、`onClearElementReference`。
- 折叠态（`:265-288`）不变。

## 6. 改造 `components/edit/PlaybackChromeRoot.tsx`

- `onMessageSend`（`:1740-1795`）原样保留，改由 ChatArea 的 `onComposerSubmit` 引用；内部 11 个副作用与 `sendMessageWithElementReference`（`:302-327`）不动。
- 元素引用：`elementReferencePill` / `onClearElementReference`（今天喂 Roundtable `:1862-1876`）转喂 ChatArea；`showElementReference` / `canPickSlideElement` / `elementPickActive` / `onToggleElementPick` 仍只给画布工具栏；`draftElementReference` 与那几个 ref 全部不动。
- `onPresentationInteractionChange`（今天由 Roundtable 上报，`index.tsx:519-529`）：来源改为 composer 的 `onActivityChange`，经 ChatArea 转发。
- **全屏黑框（2026-09-22 定案：恒预留一列，不做"贴余白"）**：在 `stageRef` 内、`ChatArea` 之前新建一列容器（宽 **268px** + `shrink-0`），只在 `isPresenting` 时渲染 composer 的 `fullscreen` 形态；`:613-614` 的"强制收起"策略改为**仍收起右侧面板、但这一列照常渲染输入条**。
  - 为什么必须预留：幻灯片区是 `aspect-[16/9] h-full`（`canvas-area.tsx:328-331`），全屏时 header 与横条高度都归零（`:1596-1598`），所谓"右侧黑框"就是视口余白——宽高比不到约 2.03:1 时它连 268px 都没有，**16:9 屏上正好为 0**。预留一列后 `CanvasArea` 在剩下的宽度里 contain，任何比例下都不遮挡课件；代价是 16:9 屏上课件缩小约 14%、上下留黑边。
  - 讨论邀请卡（全屏）**不搬动**：它锚在 `fixed bottom-5` 的 dock 头像上（`roundtable/index.tsx:950` / `:988`），按视口坐标落在锚点上方 12px（`proactive-card.tsx:63-80`），因此会盖住幻灯片下缘那条带子——与今天一致，且它是会自动跳过的短暂件；P1 的"课件区不留悬浮件"只针对常驻的输入条。
  - `roundtable/index.tsx:770` / `:794` / `:808` / `:951` 那几处按 `chatCollapsed / chatAreaWidth` 算的 fixed 偏移跟着改（输入条搬走后它们只剩工具栏与气泡）。
- 横条常量：`roundtableHeight = 192`（`:1597`）与 `roundtable/index.tsx:1141` 的 `h-[192px]` **不变**（Q18 只撤控件，不改高度）；`sceneViewerHeight`（`:1595-1599`）不动。`lib/edit/contain-box.ts:55` 的 `PLAYBACK_CHROME_PX = 80 + 168` 是影子常量（只喂工作台面板宽度），本次不动。

## 7. 改造 `components/roundtable/index.tsx`

**撤**（右栏下半截，`:2063-2183`）：发送冷却三点波、麦克风、气泡按钮、用户大头像、第二处"轮到你了"提示。
**留**：左栏（老师 + 老师版 `ProactiveCard` 锚点，`:1176` / `:1264-1280`）、中栏卡片（气泡、thinking、端闪）、**右栏上部学生 agent 头像条**（`:1870-2057`：`studentAvatarRefs` 锚点、人设悬停卡、说话 / 思考指示、发起讨论时的光环）。
**删**：非全屏输入面板与语音态（`:1327-1384` / `:1387-1426`）、全屏输入面板与语音（`:812-860` / `:863-897`）、全屏 dock 的麦克风与文字按钮（`:1033-1071`）、全屏用户头像（`:1073-1104`，其"轮到你了"角标由黑框输入条承担）、中栏与全屏的引用 pill 展示位（`:1323-1325` / `:810`，改由 composer 展示）。
**删**：输入态整块（`isInputOpen` / `isVoiceOpen` / `inputValue` / `isSendCooldown` 与 `handleSendMessage` / `handleToggleInput` / `handleToggleVoice` / `handleContinueSoftClosing`、录音实例）；`onMessageSend` / `onInputActivate` / `onUserInputActivity` 三个 props 的消费点。
**保留**：`userMessage` 那套 3 秒紫色气泡（`:225`、`:298-316`、中栏渲染 `:1619-1857`）——它是舞台侧的对话可视化。
**退役说明**：旧发送冷却的两段式语义（发送 → agent 气泡出现）由 composer 的 `disabled = isStreaming` 承担；`isSendCooldown` 不再需要。

## 8. 快捷键（T / V / Escape）

落点从 `roundtable/index.tsx:452-517`（整块删）搬到 `PlaybackChromeRoot.tsx:1461-1551` 那套全局 keydown 里，三条语义：

- **T**：焦点不在任何输入控件时——若右侧面板是收起态先展开，然后切到对话 tab 并聚焦输入框。
- **V**：焦点不在输入控件时——在面板输入框里开始录音；录音中再按 V 停止。
- **Escape**：录音中 → 停止录音；输入框有焦点 → 失焦（沿用今天的 `stopPropagation`，不要因此退出全屏）；其余情况交回现有的全屏退出逻辑（`:1494-1502`）。
- 现有的 `isPresentationShortcutTarget` 过滤（`:1447-1459`）按上面三条分别处理（Escape 是例外，必须能看到输入框焦点）。空格仍归现有逻辑（`:472-484`）。

## 9. i18n

新增键（挂在 `chat.*` 下，**同步 12 个 locale**，`pnpm check:i18n-keys` 严格比对键名，不比值）：
`chat.history.open` / `title` / `newTalk` / `rename` / `renamePlaceholder` / `today` / `yesterday` / `earlier` / `empty`、`chat.status.stop` / `otherRunning`、`chat.stream.newContent`、`chat.composer.send` / `voice` / `voiceHint`。
沿用现键：`roundtable.inputPlaceholder`（placeholder 文案不变）、`chat.badge.*`、`chat.ended`、`chat.startConversation`、`chat.softClosing`（"继续"）。

## 10. 跟随改的测试

**修**：
- `e2e/tests/classroom-interaction.spec.ts:165-268`——整套挂在横条三个 testid + placeholder 上。改为断言"对话面板里的 composer"（用 `chat-composer` 与 textarea 的新 testid），保留两条不变量：文本域高度上限 100px、Escape 关 / 再按 T 复现且值保留。
- `e2e/tests/interactive-state-reference.spec.ts:93-99` / `:190-196`、`e2e/tests/interactive-component-reference.spec.ts:207-213`——`T` → placeholder → fill → Enter 的路径不变（placeholder 未改），确认新的 T 落点仍然工作即可。
- `tests/components/edit/playback-chrome-root-element-reference-owner.test.ts`——把 mock 的 Roundtable 换成 mock 的 ChatArea（`send` / `owner-pill` 两个 testid 挪过去），其余断言全部保留。

**新增**：
- `tests/lib/chat/session-groups.test.ts`：分组边界（跨天、空列表、只有更早）。
- `tests/lib/chat/display-session.test.ts`：注入 KV 的读写 / 坏数据 / 清理；stage 删除级联扩到 `tests/runtime/stage-delete-wiring.test.ts`。
- `tests/chat/composer.test.tsx`：Enter / Shift+Enter / IME、录音结果落草稿不自动发送、cue 态、disabled。
- `tests/chat/use-chat-sessions-display.test.ts`：兜底链（指针失效 → 最新 → null）、续写复活（completed → active、复用 sessionId、带上 `directorState`）、未读（引擎写入非显示会话 → 未读；`setDisplaySessionId` 清零）。
- `tests/chat/chat-area-transcript.test.tsx`：贴底跟随（距底 < 24px 出/不出"有新内容 ↓"、点它落底并消失）、状态条三态（活跃 / soft-closing 倒计时 / 另一端 · 回去）。
- **守卫（今天没有守门）**：断言横条不再渲染麦克风 / 气泡按钮 / 用户头像，且右栏头像条与 `ProactiveCard` 锚点仍在。

## 11. 不做的事

后端与存储层改动（单条真删除、跨设备）· 隐藏 / 删除（2026-09-22 决定不做）· 建议问题卡 · 模型选择与联网搜索开关 · 笔记 tab 任何改动 · 消息渲染增强（Markdown / 代码高亮 / 公式 / 复制 / 重试 / 打字机跳过）· 移动端与窄屏（<1024px）· 工作台会话历史 · lecture 会话进列表 · 多会话并行 · legacy / Pi 双后端与 SSE 传输层 · 跨标签页会话写覆盖。

## 12. 验证方式

`pnpm lint` · `npx tsc --noEmit` · `pnpm check:i18n-keys` · `pnpm test`（口径：**没有新增失败**——现状有 3–4 个既有失败套件：`tests/runtime/chat-storage.test.ts`、`tests/quiz/runtime.test.ts`、`tests/media/server-backed-media-orchestrator.test.ts`、`tests/workbench/workspace-rail-session-rename.test.ts`）· `pnpm test:e2e`（playwright 自起服务，端口 3002）。
手测（kimi-webbridge）：面板常驻与输入、录音落草稿、轮到你了、历史浮层与改名、刷新回落、全屏黑框、切场景时对话就地收尾、讨论邀请卡仍在原位。

## 13. 落地顺序（每步可独立验证）

1. composer 组件 + 面板常驻（输入区先在面板里活起来，横条照旧）。
2. `display-session.ts` + `displaySessionId` + 兜底链。
3. 续写复活（判据点）+ 标题派生。
4. 未读 + 状态条 + 消息流"有新内容 ↓"。
5. 历史浮层 + 改名。
6. 撤右栏下半截 + 删旧输入面板 / 旧输入态 / 旧快捷键。
7. 全屏预留一列（268px 黑框）+ fixed 偏移收尾。
8. i18n 12 文件 + 测试修补与新增。
