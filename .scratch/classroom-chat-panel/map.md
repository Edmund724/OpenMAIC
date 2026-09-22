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
  - 历史入口是**面板顶部的浮层**（对话常驻，历史从顶部盖下来一层；原型已确认，变体 B）；列表按"今天/昨天/更早"倒序分组；条目 = 标题（学生首句，可重命名）+ 时间 + 类型与状态小图标；有"新对话"按钮；删除做成**本地隐藏**。
  - 点开已结束的旧对话**可以接着问**；讲课记录（lecture 会话）**不进列表**。
  - 学生随时可问，但"轮到你了"时输入区高亮 + 对话 tab 琥珀点。
  - 暂停讲课只在学生**真正开始输入**时触发（聚焦/按键/开始录音），常驻本身不暂停。
  - 全屏那套输入条与面板输入框是**同一个组件两处渲染**，草稿互不共享；全屏时它收成窄栏形态（按钮只留图标）住进右侧黑框。
  - 舞台上悬浮 3 秒的紫色气泡**保留**（两种模式都留）。
  - 快捷键：T = 切到对话 tab 并聚焦输入框；V = 在输入框里开始录音；Escape = 停止录音/取消聚焦；空格不变。
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
- **参照**：`reports/chat-tab-optimization.md`（本 effort 开工前刚产出的改进点清单；其中 B1/B2/B4/D1/E2 与本 effort 直接重叠，A/C/D3 组不在范围内）。

## Decisions so far

<!-- 一行一条： [票名](相对链接): 结论要点 -->

- [R1：主流 AI 对话产品的会话管理惯例调研](issues/01-ai-chat-conventions-research.md): 六家一致（列表在侧边栏、条目只显示标题、标题自动生成可重命名）；时间表达三种做法并存且**六个产品都不给逐条时间戳**，靠分组表达（Copilot 官方明确移除）；重命名/删除有"条目菜单"与"对话页顶部"两种范式；窄容器两屏是平台级规范（Material list-detail 点名消息类应用：compact 下就地替换、返回键回列表、尺寸变化保留状态）；后台推进的会话**自动切前台在六个产品里无先例**（相邻先例只有站内客服组件）。细节与逐条出处见 research/01-ai-chat-conventions.md
- [P1：课堂对话面板原型](issues/02-panel-prototype.md): 四个变体（改造前 / A 两屏切换 / B 历史浮层 / C 上下分栏）做出后用户选定 **B**——对话常驻、历史从面板顶部盖一层浮层，学生永远不离开对话屏。附带定下：全屏讲课的输入条移进**右侧黑框**（幻灯片区之外、收成窄栏形态），课件区不留任何悬浮件。原型在 `app/prototype/classroom-chat`，可点、带状态开关

## Not yet specified

<!-- 见 "Fog of war"：在范围内、但还看不清、不足以立票的东西 -->

- 列表条目要不要保留逐条时间戳（R1 发现六个产品都去掉了、只靠分组表达；原型 B 里带了时间，用户看过未提异议）——写规格时按"保留"处理，除非另有指示
- 浮层打开时引擎自动开新会话的手感（浮层要不要自动关、动画与时机）——待 G1
- 全屏右侧黑框的最终宽度与窄栏形态的取舍（原型用 268px + 图标化按钮）——待 S1 定稿

<!-- 原型已把下面六项定型，它们随 S1 写进规格，不再单独立票：
     输入区视觉（文本框 + 一行按钮：引用课件 / 说话 / 发送；录音态 = 波形 + 实时文字 + 取消/完成）
     "轮到你了"（输入区琥珀色描边 + 上方提示条 + 对话 tab 琥珀点）
     空对话屏（图标 + "开始一段新对话"）
     列表条目（标题 + 类型徽章 + 时间 + 状态点，悬停出"改名/隐藏"）
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
