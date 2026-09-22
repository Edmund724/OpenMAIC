# 对话 Tab 可改进点清单

> 基于对 chat 前端（`components/chat/`）、双后端路径（`/api/chat` legacy 与 `/api/chat/pi`）、上下文注入与会话隔离机制的代码调研整理。
> 每条附证据位置（文件:行号）。按层组织，供挑选后再立任务。

---

## 背景速览（一句话版）

- 双后端：legacy（前端 `lib/chat/agent-loop.ts` 串行 POST）与 Pi（服务端 `lib/chat/pi/director-loop.ts` 完整 loop），由 `NEXT_PUBLIC_PI_CHAT_ENABLED` 切换（`lib/config/feature-flags.ts:89`）。
- 无状态请求：每次带全量 `messages` + `storeState` + `directorState`（`lib/types/chat.ts:330`）。
- 隔离模型：**消息按 session 隔离，教室状态（白板/场景/quiz）全局共享**。
- 输入框在 Roundtable（`components/roundtable/index.tsx:407`），ChatArea 只是展示面板（`components/chat/chat-area.tsx`）。

---

## A. 消息渲染与交互（用户感知最强）

### A1. 文本裸渲染，无 Markdown / 代码高亮 / 公式 ⭐推荐
- 现状：`components/chat/chat-session.tsx:131` 直接 `{text}` 输出，agent 回复中的代码块、列表、LaTeX 全部显示为纯文本。
- 改进：接入流式安全的 Markdown 渲染（渐进解析、不抖动）；代码高亮；公式渲染（项目已有 KaTeX 依赖，见 `scripts/generate-video-export-katex.mjs`）。
- 注意：流式打字机下每 30ms 文本变一次，渲染必须 cheap（可按 part 封口后再升级富渲染，`onSegmentSealed` 回调已存在，`chat-area.tsx:47`）。
- `components/ai-elements/` 下的 `code-block`、`chain-of-thought` 等 30 个组件全仓库无 import，可评估复用或删除。

### A2. 消息无任何操作：复制 / 重试 / 编辑重发
- 现状：`MessageBubble`（`chat-session.tsx:46`）只有渲染与状态点，无复制、无 regenerate、无编辑用户消息重发。
- 改进：至少加"复制"；对 error/interrupted 消息加"重试"；用户消息可编辑重发（需定义重发时是否截断后续历史）。

### A3. 打字机速度固定 33 字/秒，无法跳过 ⭐推荐
- 现状：`lib/buffer/stream-buffer.ts:208` `tickMs=30, charsPerTick=1`；discussion/QA 还额外 `postTextDelayMs:1200, actionDelayMs:800`（`use-chat-sessions.ts:914`）。`flush()` 已存在但只在恢复会话时用（`stream-buffer.ts` flush）。
- 改进：点击气泡/按钮"立即显示全部"；速度可配置或按剩余长度自适应加速；长代码块可瞬时揭示。

### A4. thinking / reasoning 过程不展示
- 现状：legacy 发 `thinking` 事件（`director-graph.ts:159/210`），Pi 路径靠前端乐观设置思考点（`PlaybackChromeRoot.tsx:1786` 附近）；模型 reasoning 内容（`lib/ai/reasoning-sse.ts` 有完整处理链）没有进课堂 chat UI。
- 改进：可折叠的"思考中/思考过程"块（可参考 ai-elements 的 `reasoning.tsx` / `chain-of-thought.tsx` 设计）。

### A5. 空态与加载态可增强
- 现状：空态两行文字（`chat-area.tsx:338-349`）；agent 回复前是三点加载（`chat-session.tsx:70-101`）。
- 改进：空态给建议问题（suggested prompts）；加载态显示当前是 director 思考还是某个 agent 在生成（`thinkingState.stage` 已有此信息）。

---

## B. 会话管理 UX

### B1. 会话列表功能极简：无搜索 / 重命名 / 删除 / 导出 ⭐推荐
- 现状：`components/chat/session-list.tsx` 只有展开折叠 + 结束按钮 + 状态徽标。
- 改进：重命名（title 现在自动生成）、删除会话（需同时清 IndexedDB 记录）、导出为 Markdown、会话多时的搜索/过滤。

### B2. completed 会话不可续，历史永远断掉 ⭐推荐
- 现状：新消息若存在 completed 会话则新建会话，messages 归零（`use-chat-sessions.ts:1795-1804`）；只有 15s 软关闭窗口（`continueSoftClosingSession`）和 interrupted 状态能续。
- 改进：允许"继续此会话"——把旧会话 claim 回 active 并带上其 messages + directorState（数据结构已支持，只是被状态机挡住）。

### B3. 单活动会话互斥
- 现状：发新消息前 end 掉所有 live 会话（`use-chat-sessions.ts:1794-1804`、`:1966-1970`）。
- 改进（若产品需要并行对话）：允许多个活动会话。难点：directorState 的白板 ledger 归属、"同时只有一个谁在说话"的课堂语义。**先确认产品是否需要，再动。**

### B4. 输入框不在 Chat Tab 内
- 现状：输入在 Roundtable（`roundtable/index.tsx:407` → `onMessageSend` → `PlaybackChromeRoot.tsx:1735`）；用户在 Chat tab 翻历史时想追问，得去底部输入区。
- 改进：Chat tab 底部内嵌紧凑输入框，复用同一 `sendMessage` 链路（注意元素引用快照、interrupt、TTS cleanup 等前置逻辑都在 `PlaybackChromeRoot.onMessageSend` 里，需抽成可共享的 handler）。

### B5. 会话与元素引用草稿解耦问题（归入 B 或 D 均可）
- 见 D2。

---

## C. 上下文 / 回答质量（后端）

### C1. director compaction 不跨请求，长会话反复压缩 ⭐推荐
- 现状：`InMemorySessionRepo` 每请求新建（`lib/chat/pi/director-compaction.ts:134`），客户端只存 `directorState` 不存摘要（`use-chat-sessions.ts:1213-1220` 只取 directorState）。每次发消息都从 UI 历史重新导入、必要时重新压缩——浪费 token 且摘要不稳定。
- 改进：把 compaction 摘要持久化进 `directorState`（结构已可扩展），下次请求直接作为初始上下文。

### C2. child agent 记忆断裂
- 现状：每次 `call_agent` 新建 agent，带最近 12 条历史 + 前次输出截 300 字 `contentPreview`（`lib/chat/pi/tools/call-agent.ts:979-986`）；同一 agent 一个 loop 内被调两次，第二次几乎不记得自己第一次说了什么、更看不到自己的 tool 结果。
- 改进：同 loop 内复用 child session；或把 child 完整输出（而非 300 字预览）注入其下次调用；或把 child 的历史按 agent 维度存进 directorState 跨轮携带。

### C3. "This Round's Context" 措辞与事实不符
- 现状：peer 段把跨请求累积的 agentResponses 标为本轮（`lib/chat/pi/prompts.ts:176`、`lib/orchestration/peer-context.ts:21-24`），模型可能误判轮次。
- 改进：改为 "Recent speaker summaries" 之类准确措辞，或真正按回合切分。

### C4. 消息全量上传，无客户端窗口管理
- 现状：director 全量历史（`director-loop.ts:222`），请求体随会话线性增长；legacy 的 director 虽只看 10×200 摘要（`conversation-summary.ts:35`）但 messages 仍全量上传。
- 改进：客户端滑动窗口（近 N 条原文 + 更早摘要）；或与 C1 结合，摘要持久化后只传摘要 + 近期消息。

### C5. legacy 已知 bug（若 legacy 仍在线上使用）
1. 单 agent 会话第二轮起 director 直接 cue_user 不派发——`turnCount` 跨消息累积触发代码快路径（`lib/orchestration/director-graph.ts:118-131`、`stateless-generate.ts:466-486`）。
2. 累积 whiteboardLedger 叠加 storeState 快照可能把同一白板元素重复计入 prompt（`whiteboard-ledger.ts:135-148`，Pi 已规避：done 只回本回合 ledger）。
- 改进：修，或加速 legacy 退役（见 E1）。

### C6. legacy 无任何上下文窗口管理
- 现状：全量消息进 prompt，无截断无压缩（仅元素文本 60 字截断 + code 行预算 `code-line-budget.ts:17`）。
- 改进：若 legacy 还要活一段时间，至少加消息数上限；否则随 E1 直接退役。

### C7. 交互面板 / 元素引用证据的预算与降级策略可再调
- 现状：面板证据 32k 码点超限**整体降级**为 unavailable（`interactive-state-evidence.ts:248-254`），元素引用字段级上限（`element-reference.ts:30-44`）。整体降级意味着大面板直接拿不到任何证据。
- 改进：超限时降级为"摘要 + 结构骨架"而非整体丢弃（需评估安全边界成本）。

---

## D. 状态与可靠性

### D1. 双实例竞争隐患 —— 已验证：不触发，已加守卫（2026-09-22）
- 现状（已核实）：`components/scene-renderers/InteractiveIframeHost.tsx` **不**渲染 `PlaybackChromeRoot`——原文把这个文件里的一句 doc 注释（`:124`）读成了渲染。每个 stage 只有一条挂载链、一个 `useChatSessions` 实例：`classroom/ClassroomSurface.tsx:571` → `stage.tsx:355`（只有 playback 分支挂）→ `PlaybackChromeRoot.tsx:1886` → `chat-area.tsx:138`。
- 机制（探针复现）：一旦真出现第二个实例，两者共享 `useStageStore.chats`（`lib/store/stage.ts:290`）却各自持 React state（`use-chat-sessions.ts:559-566`，只在挂载时从 store 播种一次），每次变化整体写回（`:626-630`，无合并）→ 后写者把先写者的会话从持久化列表里抹掉。
- 改进（已定）：**不必**把会话 state 下沉到 zustand。真需要时的便宜后路：写回效果只允许 owner 执行，secondary 实例改为订阅 `useStageStore.chats` 只读镜像。
- 守卫：`tests/chat/chat-session-mount-graph.test.ts`（出现第二个挂载点即变红）与 `tests/chat/chat-session-double-instance-hazard.test.ts`（双实例复现；注意断言极性是"绿＝机制成立"）。结论与边界见 `.scratch/classroom-chat-panel/issues/04-verify-double-instance.md`。

### D2. 元素引用草稿不挂会话
- 现状：草稿是 `PlaybackChromeRoot` 组件级 state（`:159-173`），切场景/换会话后仍在，可能把 A 场景的引用带进 B 会话的提问（有 selectionVersion + accepted header 兜底，但语义脆）。
- 改进：草稿绑定 sceneId（发送时校验当前场景一致才携带）；或会话切换时清空。

### D3. SSE 解析手写两份，且无断线恢复
- 现状：`runPiSingleRequest`（`use-chat-sessions.ts:422-437`）与 `runAgentLoop`（`agent-loop.ts:210-229`）各写一遍 `\n\n` 切块 + `data:` 解析；heartbeat（15s `:ping`）收到后如何处理未见统一逻辑；流中断（网络抖动）只能整轮失败，interrupted 恢复靠刷新页面。
- 改进：抽公共 SSE parser（带 heartbeat 超时检测）；评估断点续传（done 前断线时，服务端已完成的部分如何找回——无状态架构下较难，至少给出更好的错误 UI + 重试按钮）。

### D4. `use-chat-sessions.ts` 2294 行单文件
- 现状：一个 hook 承担会话 CRUD、StreamBuffer 管理、SSE 消费、软关闭状态机、持久化同步、Pi/legacy 分流。
- 改进：拆模块（会话状态机 / 传输层 / 缓冲桥接）；**拆之前先补测试**——`tests/chat/` 仅 5 个文件，覆盖远小于其复杂度。可测的纯逻辑（软关闭状态机、outcome 映射 `getPiSingleRequestOutcome`、退出条件判定）应先抽纯函数。

### D5. 持久化写入策略未验证
- 现状：每条消息经 `setChats → saveToStorage → saveChatSessions → IndexedDB`（`use-chat-sessions.ts:626-630`、`stage-storage.ts:160`）；流式过程中高频 state 更新是否触发高频写盘未确认。
- 改进：确认 debounce/增量策略；若每 delta 全量序列化所有会话，长会话下有性能隐患。

---

## E. 架构（长期）

### E1. legacy 退役计划 ⭐维护成本最大项
- 现状：两套 prompt 构建、两套"工具"机制（JSON 解析 vs 真 tool calling）、两套 bug 面；legacy 的结构化解析需要三层防泄漏护栏（`stateless-generate.ts:264/327`）。
- 改进：明确 Pi 稳定性验收标准（哪些课型/哪些 flag 组合），灰度全开后删除 legacy 路径、`agent-loop.ts` 的 POST 循环、director-graph。注意 `agent-loop.ts` 被 eval 复用（`eval/whiteboard-layout/runner.ts:135`），退役时需给 eval 换接口或保留纯循环部分。

### E2. ai-elements 目录 30 个组件全仓库零 import
- 现状：仅出现在 README / `components.json`（shadcn registry 清单）。
- 改进：要么在 A1/A4 中真正启用（message/reasoning/code-block/prompt-input），要么删除，避免"看起来有其实没有"的误导。

### E3. 只允许一个活动会话的课堂语义复审
- 见 B3。连带问题：新会话不继承旧会话上下文（归零），用户连续追问多个话题时每轮都从零理解语境；`piSessionBoundary` 只传"上个会话结束原因+是否同场景"元信息（`prompts.ts:339-360`），不含内容。若产品期望"课堂记忆连贯"，需要设计跨会话的轻量上下文传递（如把上个会话的摘要注入新会话 director prompt）。

---

## 优先级速查

| 优先级 | 项 | 理由 |
|---|---|---|
| 高（用户感知） | A1 Markdown、A3 打字机跳过、B1 会话管理、B2 旧会话可续 | 纯前端，风险低收益明显 |
| 高（正确性） | C5 legacy bug（若还在用） | 已知错误 |
| 中（回答质量） | C1 compaction 持久化、C2 child 记忆、C3 措辞 | 后端改动，需评估 token 成本 |
| 中 | A2 消息操作、A4 thinking 展示、B4 tab 内输入框、D3 SSE 统一 | 体验完善 |
| 低/需产品决策 | B3 多会话并行、C7 证据降级、E1 legacy 退役、E3 跨会话记忆 | 涉及语义/架构决策 |
| 先验证再立项 | D5 | 需要性能数据支撑 |

D1 已于 2026-09-22 验证：不触发（原文把一句 doc 注释读成了渲染），已加守卫测试——见 D1 条。
