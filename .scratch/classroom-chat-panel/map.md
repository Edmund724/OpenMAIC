# 地图：课堂对话面板改版——把学生发言搬进对话 tab

Type: wayfinder:map
Status: open

## Destination

一份**经原型确认的实现级设计规格**：把学生发言入口从左下角横条搬进右侧"对话"tab 下方，做成标准 AI 聊天式的输入区；横条上不再保留任何学生控件（麦克风、气泡按钮、头像全部撤走）；全屏讲课时输入条移进**右侧黑框**（幻灯片区之外，任何屏幕比例下都不遮挡课件——全屏会强制收起右侧面板，`PlaybackChromeRoot.tsx:613-614`）；历史/新对话按"对话列表"心智重做，课堂自动会话并入同一列表并带类型标记。规格细到"改哪个文件、改成什么结构、哪些测试跟着改"。

原型已确认（P1）：观感以**变体 B（历史浮层）**为准，再固化成规格。

## Notes

- 领域：Next.js + React + Tailwind 的 AI 课堂（OpenMAIC fork）。学生看课件（左）、问 AI（右）。桌面场景。
- **工作方式**：grilling 票开场调 Skill: grilling + domain-modeling；research 票调 Skill: research；原型票调 Skill: prototype。
- **用户偏好**：中文；表达简洁；每行改动可溯源到请求。
- **本 effort 携带执行**：P1 产出可点原型（假数据，不碰课堂逻辑），S1 产出规格。不写产品代码。
- **已拍板的形状**（grilling 三轮的结论，细节见各票）：
  - 输入区**常驻**在对话 tab 底部；视觉只借参考图的布局，配色跟现有白/紫半透明圆角；面板宽度上限 560 → 640，最小 240 不动（输入区自适应折行）。
  - 语音**点按切换**；识别完**先落进输入框**让学生确认，不再自动发送。
  - 历史入口是**面板顶部的浮层**（对话常驻，历史从顶部盖下来一层；原型已确认，变体 B）；列表按"今天/昨天/更早"倒序分组；条目 = 标题（学生首句，可重命名）+ 类型与状态小图标（逐条时间戳去掉，时间只由分组表达，精确时间放悬停 title）；有"新对话"按钮；删除做成**本地隐藏**。
  - 点开已结束的旧对话**可以接着问**；讲课记录（lecture 会话）**不进列表**。
  - 学生随时可问，但"轮到你了"时输入区高亮 + 对话 tab 琥珀点。
  - 暂停讲课只在学生**真正开始输入**时触发（聚焦/按键/开始录音），常驻本身不暂停。
  - 全屏那套输入条与面板输入框是**同一个组件两处渲染**，草稿互不共享；全屏时它收成窄栏形态（按钮只留图标）住进右侧黑框。
  - 舞台上悬浮 3 秒的紫色气泡**保留**（两种模式都留）。
  - 快捷键：T = 切到对话 tab 并聚焦输入框；V = 在输入框里开始录音；Escape = 停止录音/取消聚焦；空格不变。
  - （G1）面板里"显示中的对话"与"活跃会话"分开：`displaySessionId` = 学生正在看哪段（lecture 永远不会是它）；历史浮层**不因引擎动作自动关**。
  - （G1）输入区上方多一条**细状态条**：有活跃 / soft-closing 会话时出现，承载"停止 / 继续（带倒计时）"与"另一端还有讨论在进行 · 回去"这类提示；消息流末尾的"已结束"分隔条只做状态展示。
  - （G1）未读 = 对话 tab 上一个琥珀点（未读 或 轮到你了，靠文案区分），学生把那一段切到前台即清零；全屏时落在右侧黑框的输入条上。
  - （G1）消息流**贴底才跟随**：手动上翻过则出"有新内容 ↓"。
  - （G1）舞台侧保留物补齐：3 秒紫色气泡 + **讨论邀请卡**（锚在发起讨论的 agent 头像旁）。
  - （G1 修正，2026-09-22）上面那条只对**老师**成立：老师锚在左栏 `teacherAvatarRef`（`roundtable/index.tsx:1176`），**学生 agent 的锚点却注册在横条右栏**（`studentAvatarRefs`，`:1920-1921`，学生版卡片 `:2046` 用它）——"整栏撤走"会把头像条与它的锚点一起撤掉，而 `ProactiveCard` 是 `fixed` 逐帧追锚点矩形（`components/chat/proactive-card.tsx:64-80`），锚点没了卡片就没有定位来源。**这条要重开**，学生 agent 那条邀请卡的落点未定。
- **关键事实（已核查，带 file:line，实现时直接引用）**：
  - 输入区今天在 `components/roundtable/index.tsx`（非全屏 `1327-1384`；全屏 `812-860`），发送经 `PlaybackChromeRoot.tsx:1740-1795` → `ChatAreaRef.sendMessage`。**后端不用改**，是纯前端搬迁。
  - `components/chat/chat-area.tsx` 只有笔记/对话两个 tab；对话 tab 是 `SessionList`（会话卡片，不是消息流）。**面板里目前没有输入框**，这是新增而非替换。
  - 会话持久化：IndexedDB `maic-runtime`，按 `chat:${stageId}:${learnerKey}:${sessionId}` 分区（`lib/utils/chat-storage-core.ts:244-250`）；刷新后列表自动恢复、全部折叠。身份是**设备匿名 key**（`lib/runtime/learner-key.ts:17`），无账号。
  - 纯前端可做：历史列表、重命名（`title` 已在持久化字段 `chat-storage-core.ts:30-44`）、"新对话"（`createSession` 现成但零调用）。不可纯前端：续写 `completed` 会话（`use-chat-sessions.ts:1796` 刻意挡住）、删除单条（存储是追加式运行时日志，无按会话删除路径）、跨设备。
  - **单活会话不变量**：`sendMessage` 会先结束所有活着的会话（`use-chat-sessions.ts:1798-1804`），列表不能表现为平行多线程。
  - `lecture` 会话是引擎产物（一场景一条助手消息，按 `sceneId` 1:1），现在被排除在对话 tab 外（`chat-area.tsx:160`）。
  - 横条高 192px 与 `PlaybackChromeRoot.tsx:1595` 的 `roundtableHeight` 是一对常量，动横条要一起改。
  - 学生的话现在被渲染两遍：舞台气泡（`index.tsx:225` 的 `userMessage`，3 秒后消失）+ 面板消息记录（`use-chat-sessions.ts:1831-1841`）。
  - i18n：源文件是 `lib/i18n/locales/en-US.json`，新键要同步 **12 个**语言文件，`pnpm check:i18n-keys` 会卡。
  - 会失效的测试：`e2e/tests/classroom-interaction.spec.ts:165`（盯非全屏输入框的 DOM）、`tests/components/edit/playback-chrome-root-element-reference-owner.test.ts`（mock Roundtable 触发 `onMessageSend`）。
  - `components/ai-elements/` 29 个文件全仓库零引用，含 `prompt-input.tsx`；其麦克风是浏览器内置识别、写死 `en-US`，**不要复用**。麦克风用现成的 `components/audio/speech-button.tsx`。
  - `lib/hooks/use-browser-asr.ts` 是死代码；真实 ASR 在 `lib/hooks/use-audio-recorder.ts`（支持浏览器内置与 `POST /api/transcription` 两条路）。
  - 面板里的消息气泡**没有 Markdown 渲染**（`chat-session.tsx:131` 裸文本 + `whitespace-pre-wrap`）；打字机由上游 `StreamBuffer` 以 30ms/字推进。
  - `activeSessionId` 今天的语义是"最近被谁激活过"，不是"学生正在看的对话"：写入点 `use-chat-sessions.ts:602`（重置）/`:1401`（createSession）/`:1508`（结束活跃会话）/`:2007`（讨论）/`:2108`/`:2156`（lecture 会话也抢）。消费者三处——`sendMessage` 的落点（`:1794-1796`，靠 `type === 'lecture'` 特判绕开）、`getActiveSessionType()`（`PlaybackChromeRoot.tsx:1912`，全屏停止按钮靠它判断在跑什么）、`retireActiveLiveRequest(activeSessionId)` 的 effect（`:2075`）。
  - 单活会话的判据是 `isOpenLiveSession`（`use-chat-sessions.ts:311-315`：type 为 qa/discussion 且 status 为 active/soft-closing）；`createSession` 建出来的就是 `status: 'active'` 的空会话（`:1400`），所以它不能直接当"新对话"用。
  - 讨论邀请卡在 `components/chat/proactive-card.tsx`，经 portal 渲染、`fixed` 逐帧追锚点矩形（`:64-80`、`:248`），锚点是老师 / 学生 agent 的头像（`roundtable/index.tsx:267-272`、`:988`、`:1113`、`:2046`）——老师锚在左栏，**学生 agent 锚在横条右栏**（`studentAvatarRefs` 注册点 `:1920-1921`）。引擎会停在 `currentTrigger` 上等学生点（`lib/playback/engine.ts:264-270`、`:347-349`）。
  - **device KV**：默认 scope 是 `'account'`，**必须显式传 `'device'`**（`packages/@openmaic/storage/src/kv/types.ts:58`，未知 scope 抛错 `:83-93`）；浏览器落盘键是 `maic:<scope>:<key>`（`kv/browser.ts:14-15`）；形状样板 `lib/document-store/current-scene.ts:13-75`；stage 删除清理钩子在 `lib/utils/stage-storage.ts:631-645` 之后再补一行，前缀批量清先例 `lib/pbl/v2/runtime/drain.ts:234-240`，守卫测试 `tests/runtime/stage-delete-wiring.test.ts:97-104`。
  - **会话字段挂不住**：`lib/utils/chat-storage-core.ts` 的 `statePayload`（`:316-336`）、`isStatePayload`（`:353-379`）、`foldRecords`（`:414-431`）都是显式字段重建，未知字段过不了持久化往返（`normalizeSession` `:232-242` 只在内存里保留）。
  - **未读没有现成字段**：引擎往会话写内容的汇集口是 `createBufferForSession`（`use-chat-sessions.ts:905-1127`）里那 4 个 `setSessions`（`:933`/`:968`/`:1011`/`:2181`），加上 `streamingSessionIdRef`（`:568`）；`updatedAt` 不可靠（`:995-997` 明确不随 tick 更新）。
  - **续写旧对话只差一个判据**：`use-chat-sessions.ts:1794-1796`（是不是 `completed`）+ 复用同一个 `sessionId`；`:1903` 会自动带上那一段的 `directorState`，不需要新管道。
  - **面板结构**：对话 tab 的"列表"与"消息流"是同一套 DOM（卡片内嵌 `ChatSessionComponent`，`session-list.tsx:120-141`）——常驻对话要把消息流从卡片里提出来；hook 返回值 `:2269-2293` 要新增 `displaySessionId`（今天它不出 hook）；`chat-area.tsx`／`session-list.tsx` **零专属测试**。
  - **输入区接线**：状态机全在 `roundtable/index.tsx` 根部（`isInputOpen:222`／`isVoiceOpen:223`／`inputValue:224`／发送冷却 `:249-250`），与非全屏 / 全屏两个分支共用；Roundtable 不持元素引用草稿（只有 `elementReferencePill` prop + `onClearElementReference`），"引用课件"按钮住在画布工具栏（`canvas-toolbar.tsx:430-452`，经 `roundtable:706-709` 透传）；麦克风是自绘 + `useAudioRecorder`（`index.tsx:378-401`），`SpeechButton` 今天没被课堂用。
  - `onMessageSend`（`PlaybackChromeRoot.tsx:1740-1795`）那 11 个副作用全是"学生发言对引擎的语义"（打断、TTS 清理、soft-close、切 tab、thinking），**一个都不该搬进 composer**；该搬的只有输入态。`sendMessageWithElementReference` 在 `:302-327`。
  - **T/V/Escape 的现役实现在 `roundtable/index.tsx:452-517`**（`configs/hotkey.ts` 只是文档）：焦点在输入框内时 T/V 失效（`:466-470`），Escape 带 `stopPropagation` 挡全屏退出；`PlaybackChromeRoot.tsx:1461-1551` 是另一套全局键（`:1447-1459` 过滤输入目标）。
  - **全屏"右侧黑框"今天不存在**：课件按 `aspect-[16/9] h-full` 居中（`canvas-area.tsx:328-335`），左右余白就是黑框；输入条是 `fixed` + 按 `chatCollapsed/chatAreaWidth` 算偏移（`roundtable:770`/`:794`/`:808`/`:951`）；全屏强制收起在 `PlaybackChromeRoot.tsx:613-614`；`ChatArea` 是 `stageRef` 内的 flex 兄弟（`:1885-1954`），展开会挤窄课件区而不是覆盖。
  - **会失效的 e2e 是三个**（都靠 `T` + placeholder `Type your message...` 定位输入框）：`classroom-interaction.spec.ts:165-268`、`interactive-state-reference.spec.ts:93-99`／`:190-196`、`interactive-component-reference.spec.ts:207-213`；jsdom 那条 `tests/components/edit/playback-chrome-root-element-reference-owner.test.ts` 把输入口与 pill 都 mock 在 Roundtable 里（`:195-237`），搬走后 `click('send')` 与 `owner-pill` 会直接抛。
  - **验证命令**：`lint`=eslint 全仓；`test`=vitest（只跑 `tests/**/*.test.ts`）；`check:i18n-keys`=12 个 locale 与 `en-US.json` 的叶子键严格对齐；`test:e2e`=playwright（自己起服务、端口 3002、`reuseExistingServer`）；CI 是 `check`/`lint`/`tsc --noEmit`/`check:i18n-keys` 并行后跑 `test`。横条 192px 与面板宽度上限 560 **都没有测试守卫**；`lib/edit/contain-box.ts:55` 的 `PLAYBACK_CHROME_PX = 80 + 168` 是与 192 不一致的影子常量（只喂工作台面板宽度，改横条不会让它变红）。
  - 停止 / 继续按钮今天在展开的会话卡片末尾（`chat-session.tsx:353-384`；`canEnd` = qa/discussion 且 active/soft-closing，`:174-175`），"已结束"分隔条在 `:330-347`。
  - **D1 的前提是错的**：`components/scene-renderers/InteractiveIframeHost.tsx` 不渲染 `PlaybackChromeRoot`（那句是把 `:124` 的 doc 注释读成了渲染）。每个 stage 只有一条挂载链、一个 `useChatSessions` 实例：`classroom/ClassroomSurface.tsx:571` → `stage.tsx:355`（只有 playback 分支挂）→ `PlaybackChromeRoot.tsx:1886` → `chat-area.tsx:138`。守卫测试：`tests/chat/chat-session-mount-graph.test.ts`。
  - 但双实例的**机制**是真的（jsdom 探针复现）：`use-chat-sessions.ts:559-566` 的 `sessions`／`activeSessionId` 是各自独立的 React state（只在挂载时从 `useStageStore.getState().chats` 播种一次），`:626-630` 每次变化整体写回 `setChats`（无合并）→ 第二个实例会把第一个的会话从持久化列表里抹掉（`chats` 只在 `getState()` 里读，不是订阅）。**结论：不必把会话状态下沉到 zustand**；真需要时的便宜后路是"写回只允许 owner、secondary 只读订阅"。
  - `pnpm test` 现状有 3–4 个**既有失败套件**（`tests/runtime/chat-storage.test.ts`、`tests/quiz/runtime.test.ts`、`tests/media/server-backed-media-orchestrator.test.ts`、`tests/workbench/workspace-rail-session-rename.test.ts`，5s 超时类，单独跑也失败）——规格的"验证方式"要按"没有新增失败"写，不是"全绿"。
- **参照**：`reports/chat-tab-optimization.md`（本 effort 开工前刚产出的改进点清单；其中 B1/B2/B4/D1/E2 与本 effort 直接重叠，A/C/D3 组不在范围内）。

## Decisions so far

<!-- 一行一条： [票名](相对链接): 结论要点 -->

- [R1：主流 AI 对话产品的会话管理惯例调研](issues/01-ai-chat-conventions-research.md): 六家一致（列表在侧边栏、条目只显示标题、标题自动生成可重命名）；时间表达三种做法并存且**六个产品都不给逐条时间戳**，靠分组表达（Copilot 官方明确移除）；重命名/删除有"条目菜单"与"对话页顶部"两种范式；窄容器两屏是平台级规范（Material list-detail 点名消息类应用：compact 下就地替换、返回键回列表、尺寸变化保留状态）；后台推进的会话**自动切前台在六个产品里无先例**（相邻先例只有站内客服组件）。细节与逐条出处见 research/01-ai-chat-conventions.md
- [P1：课堂对话面板原型](issues/02-panel-prototype.md): 四个变体（改造前 / A 两屏切换 / B 历史浮层 / C 上下分栏）做出后用户选定 **B**——对话常驻、历史从面板顶部盖一层浮层，学生永远不离开对话屏。附带定下：全屏讲课的输入条移进**右侧黑框**（幻灯片区之外、收成窄栏形态），课件区不留任何悬浮件。原型在 `app/prototype/classroom-chat`，可点、带状态开关
- [G1：面板与课堂引擎的边界行为](issues/03-panel-engine-boundary.md): "显示中的对话"（新词 `displaySessionId`）与"活跃会话"分开，抢前台的判据是**"谁的动作"**——学生发起的（点加入讨论、发消息）才切前台并关浮层，引擎自己发起的（soft-close 复活、切场景结束、lecture 进场）只出未读提示。"新对话"= 纯草稿位（不落会话、不动活跃会话）；点开旧对话只换显示、真发消息时才结束旧的活跃会话并接管；续写旧对话 = **复活那一段会话本身**并带上它的 `directorState`；停止 / 继续搬进输入框上方的状态条；未读只用一个琥珀点、切到前台即清零；被引擎就地结束就安静收场；草稿按会话各留一份；lecture 不再抢显示指针；列表去掉逐条时间戳；讨论邀请卡留在舞台侧；消息流贴底才跟随。理由与 file:line 见票
- [T1：验证双实例会话状态竞争](issues/04-verify-double-instance.md): **D1 的前提不成立**——`InteractiveIframeHost` 不渲染 `PlaybackChromeRoot`（原文把一句 doc 注释读成了渲染），每个 stage 只有一条挂载链、一个 `useChatSessions` 实例，**不必把会话状态下沉到 zustand**。但机制是真的：真有第二个实例时，`:626-630` 的整体写回会把对方的会话从 `useStageStore.chats` 里抹掉（jsdom 探针复现）。产出两个测试——`tests/chat/chat-session-mount-graph.test.ts`（守卫：第二个挂载点出现即红）、`tests/chat/chat-session-double-instance-hazard.test.ts`（复现，绿＝机制成立）。重开条件：新增第二个挂载点，或把课堂挂进第二个 React root

## Not yet specified

<!-- 见 "Fog of war"：在范围内、但还看不清、不足以立票的东西 -->

- 全屏右侧黑框的最终宽度与窄栏形态的取舍（原型用 268px + 图标化按钮）——待 S1 定稿
- G1 新定的两个画面原型里没画过（输入区上方的状态条、"有新内容 ↓"）——存在已定，观感待 S1 前在原型里补一眼
- 全屏时讨论邀请卡经 `portalContainer` 渲进全屏容器，会不会压到幻灯片区（与 P1 定的"课件区不留悬浮件"对不上）——S1 定稿前核一眼
- **学生 agent 发起的讨论邀请卡住哪**：它的锚点（`studentAvatarRefs`）就在 P1 要整栏撤走的横条右栏里，`ProactiveCard` 没有锚点就没有定位来源；老师那条锚在左栏、不受影响。要么保留右栏上部的学生 agent 头像条，要么把学生那条改锚/改住别处——待定（会同时修订 P1 的"整栏撤走"与 G1 的"邀请卡留在舞台侧"）

<!-- 原型已把下面六项定型，它们随 S1 写进规格，不再单独立票：
     输入区视觉（文本框 + 一行按钮：引用课件 / 说话 / 发送；录音态 = 波形 + 实时文字 + 取消/完成）
     "轮到你了"（输入区琥珀色描边 + 上方提示条 + 对话 tab 琥珀点）
     空对话屏（图标 + "开始一段新对话"）
     列表条目（标题 + 类型徽章 + 状态点，悬停出"改名/隐藏"；逐条时间戳按 G1 去掉）
     窄面板折行（按钮收成图标，标签隐藏）
     横条右栏（整栏撤走，横条仍是 192px、两栏布局） -->

## Out of scope

- 后端与存储层改动：单条会话真删除、跨设备历史（需账号系统）——用户明确"后端不变"，隐藏列表是替代方案
- 建议问题卡——用户明确不要
- 模型选择与联网搜索开关——用户明确不要
- 笔记 tab 的任何改动
- 消息渲染增强（Markdown / 代码高亮 / 公式 / 复制 / 重试 / 打字机跳过）——见 `reports/chat-tab-optimization.md` A 组，属另一条线
- 移动端与窄屏（<1024px）适配——课堂是桌面场景
- 工作台（`/workbench`）的会话历史——另一套表面，不动
- 讲课记录（lecture 会话）暴露进列表——已决定不进
- 多会话并行（同时存在多个活动会话）——会破坏课堂单活语义与白板 ledger 归属
- legacy / Pi 双后端与 SSE 传输层——见报告 C、D3 组
- 跨标签页的会话写覆盖：同一课堂开两个标签，两个 JS 上下文各持一份 `chats`，写回 IndexedDB 就是后写覆盖先写（T1 发现；不是 D1 那条，"下沉 zustand"也修不了）
