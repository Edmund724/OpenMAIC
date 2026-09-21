# PBL 管线学生数据采集机制调查报告

- 调查日期：2026-09-21
- 范围：OpenMAIC 仓库（main 分支工作区）中 PBL v2 管线的学生数据采集
- 方法：只依据仓库源码逐条追查，所有结论附 `文件:行号`。`lessons/`、`reference/` 下的 HTML 是教学材料（由一份已不在 `reports/` 的报告派生，`NOTES.md:3-5` 自述与代码存在漂移），本报告一律以代码实现为准。

## 1. 一句话结论

PBL 管线采集的学生数据集中在 `PBLProjectV2` 这一个 JSON 文档上：一个**追加式 engagement 事件账本**、一个**runtime 事实事件账本**、**学习者产出（submissions）与评估（evaluations）**、**完整聊天线程**、以及一个**自适应熟练度评估状态**。采集动作大部分发生在**服务端**（Next.js API 路由内的确定性代码与 Instructor LLM 工具调用），SSE 把增量以 patch 形式回传给浏览器；浏览器是事实上的"源真相"（source of truth），再经客户端 drainer 把两个账本落入 RuntimeStore（默认 IndexedDB，可配置为经 `/api/persistence` 落到 PostgreSQL）。

## 2. 数据流向总览

```
浏览器（projectV2 源真相，内存 + scene.content）
  │  POST 整个 projectV2（无服务端持久化，服务端只改内存副本）
  ▼
Next.js API 路由（app/api/pbl/v2/*）
  ├─ /instructor、/open-task、/simulator：SSE 流式返回 token + project_patch
  │    （advance / engagement_event / message / proficiency 等 patch 种类，sse.ts:47-160）
  ├─ /task/update：纯状态变更，返回整份 project（route.ts:1-18）
  └─ /evaluate：任务/里程碑/结项三级评估，SSE 返回 evaluation patch
  ▲
浏览器 apply patch 到自己的 project 副本（apply-instructor-event.ts:42-60，
advance-patch.ts:72-187），随后：
  ├─ 文档持久化：stripToDesignTemplate 剥掉全部 learner state 只存设计模板
  │    （document-persistence.ts:14-46，learner-state.ts:126-178）
  └─ drain：runtimeEvents + engagementEvents 两条环形 outbox 按水印追加进
       RuntimeStore（drain.ts:242-307），存不下/回放由 pbl_snapshot 兜底
       （hydration.ts:115-154）
```

关键架构事实：**服务端无状态**。`/api/pbl/v2/instructor` 的注释明确写着"the client posts the full `PBLProjectV2`…it keeps the server stateless"（instructor/route.ts:1-14），"The client is the source of truth"（instructor.ts:1294-1300）。`advance-patch.ts:1-9` 进一步说明：因为浏览器持有的 project 稍后要发给 `/evaluate`，推进检查点必须作为 SSE patch 跨边界回传。

## 3. 采集哪些学生数据

### 3.1 Engagement 事件账本（学习行为分析，核心）

事件种类定义在 `lib/pbl/v2/types.ts:191-211`，共 9 种：

| kind | payload | 生产写入方（当前代码） |
|---|---|---|
| `microtask_opened` | — | 确定性代码：任务 todo→in_progress（progress.ts:452, 548, 792） |
| `learner_turn` | `{ chars }` | Instructor 每轮学习者消息（instructor.ts:1345-1349）；情景剧 Simulator 线程（simulator.ts:477-492） |
| `observation_error` / `observation_struggle` / `observation_question` | `{ signature, label, note }` | Instructor 的 `record_observation` 工具，LLM 判断调用（instructor.ts:1423-1469；schema 只允许 error/struggle/question 三种 kind，schemas.ts:62-92） |
| `observation_concept_unlocked` | `{ signature, label, note }` | **不再由 LLM 记录**；现由提交评测通过后的确定性代码写入（task-completion.ts:159-175，调用点 components/scene-renderers/pbl/v2/submission.tsx:544-550） |
| `closing_check` | `{ question, learner_answer, quality, coreConcept }` | **当前无生产写入**（仅类型、消费端与测试引用；旧设计中的 `record_closing_check` 工具已不存在，instructor.ts:1422-1483 现只挂两个工具） |
| `stage_synthesis_check` | 同上 | **当前无生产写入**（同上） |
| `microtask_completed` | `{ reason }` | 确定性代码：advanceMicrotask / completeRoleplayAct（progress.ts:509-513, 695-700） |
| `microtask_skipped` | — | **当前无生产写入**（遗留类型，仅 types.ts:206 声明与聚合 case） |
| `proficiency_changed` | `{ from, to, reason, score, confidence }` | 自适应引擎跨档时（dynamic-signals.ts:58-69；types.ts:207-211 注明对学习者不可见） |

事件结构：`{ id, kind, microtaskId?, milestoneId?, ts, payload? }`（types.ts:216-226）。账本是**有界环形缓冲，软上限 500 条**，超出丢最旧（engagement.ts:25-28, 60-64，位于 `packages/@openmaic/generation/src/pbl/operations/kernel/`，`lib/pbl/` 下是兼容 re-export，lib/pbl/v2/operations/kernel/engagement.ts:1-2）。

派生数据：`microtaskEngagement()`（engagement.ts:67-153）从账本重放出每个微任务的 `PBLEngagementSummary`——起止时间、时长、学习者轮数、错误数、重复错误数（按 signature 去重）、解锁概念、挣扎点、提问数、closing 问答（types.ts:57-78）。完成时这份 summary 被冻结缓存在微任务上（progress.ts:515-526），作为账本滚出后的"救生索"。**时长是 opened 与 completed 两事件时间戳之差算出来的，不是单独埋点**。

### 3.2 Runtime 事实事件账本

`PBLRuntimeEvent`（types.ts:253-320）记录发生了什么事实：`message_created`、`tool_call_*`（预留）、`submission_created`、`evaluation_created`、`status_changed`、`project_reset`、`handover_staged/consumed`、`task_completion_staged/cleared`、`proficiency_updated`。写入方是各 kernel 操作函数（如 submission.ts:50-58、evaluation.ts:63-71、progress.ts 中大量 appendStatusChangedRuntimeEvent）。与 engagement 账本的区别：runtime 事件带 `actorType`（user/agent/system）且部分种类需要附带完整对象快照（attachment），落库时由 `enrichPBLRuntimeEvent` 补齐（record-payloads.ts:19-27, 130-201）。

### 3.3 学习者产出与评估

- **Submissions**：`{ id, microtaskId, kind: text|file|link, content, filename?, mimeType?, fileUrl?, summary?, createdAt }`（types.ts:105-124）。前端提交面板直接对 project 克隆调 `addSubmission`（submission.tsx:719-729，实现 submission.ts:24-61），随后立即触发任务级评测。
- **Evaluations**：Instructor 结构化反馈 `{ feedback, strengths, improvements, score?(0-100), stars?(0-5), whatYouBuilt/learned/whatsNext, actGoals? }`（types.ts:156-184），由 evaluator agent 经 `/api/pbl/v2/evaluate` 产生（evaluate/route.ts:92-130），`addEvaluation` 写入（evaluation.ts:29-74）。
- **聊天线程**：`PBLAgentThread.messages` 完整保留学习者与 agent 的全部消息（types.ts:455-490）；超阈值时旧半段折叠成 summary（types.ts:486-489，instructor.ts:1737-1743）。
- **内部教学记录**：`internalAssessment { problems, resolution, performance }` 与 `completionReason` 在任务推进时写入（progress.ts:506-507），types.ts:45-51 明确"Never shown to the learner — internal teaching record"。

### 3.4 自适应熟练度画像（profiling）

`PBLProficiencyAssessment`（types.ts:400-429）：连续分数 score∈[-1,1]、置信度、当前档位（beginner/intermediate/advanced，±0.33 分界、±0.20 迟滞）、信号历史（**上限 50 条**，types.ts:415）、档位迁移史。信号种类 `ProficiencySignalKind`（types.ts:336-350）分两类：

- 静态（PBL 前）：outline 关键词、前序场景难度、用户 bio、自述水平、测验正确率；
- 动态（PBL 中）：提交得分、任务速度（按 learnerTurnCount 推断，dynamic-signals.ts:128-158）、求助、概念困惑、自我纠正、强制推进、closing_check 质量。

信号入口集中在 `dynamic-signals.ts`：observation → `trackObservation`、微任务完成 → `trackMicrotaskCompletion`、提交得分 → `trackSubmissionScore`（客户端在拿到评测分后调用，submission.tsx:527-529）、学习者显式调难度 → `applyProficiencyDirective`（**学习者的自述被当作 ground truth 直接改档**，dynamic-signals.ts:170-224）。另有两条采集通道：

- **Pre-play 测验快照**：Hero 页进入项目时 `buildQuizSnapshot` 从 RuntimeStore 读本课程之前所有 quiz 场景的作答结果（quiz-snapshot.ts:42-87，调用点 hero.tsx:135），搭 `/api/pbl/v2/open-task` 的便车发给服务端折入画像（open-task/route.ts:66-80，quiz-snapshot.ts:94-116）。
- **Planner 期静态信号**：生成课程时从 outline、bio、原始需求文本提取（types.ts:560-607 的 `PBLPlannerV2Input.user`）。

## 4. 采集发生在哪个环节

按写入主体分三类：

1. **服务端确定性代码**（不占 LLM 判断）：microtask_opened/completed、submission_created、evaluation_created、status_changed、handover_*、task_completion_*、proficiency_updated、concept_unlocked（评测通过后）、proficiency_changed（引擎跨档）。
2. **服务端 LLM 工具调用**：Instructor 每轮只暴露两个工具——`record_observation`（分析性事件，"Analytics only — this does NOT advance the task"，instructor.ts:1423-1426）和 `adjust_difficulty`（instructor.ts:1472-1482；greeting/setup 阶段完全不挂工具，instructor.ts:1505-1515）。`learner_turn` 是每条学习者消息到达时无条件记录（instructor.ts:1332-1349）。
3. **浏览器端**：submissions 的创建、quiz 快照的组装、patch 的应用、drain 与文档持久化都在客户端完成。

前端发起方组件：`chat.tsx`（发送消息→/instructor，chat.tsx:506；点 Done→/task/update 再 /open-task setup，chat.tsx:197-249）、`workspace.tsx`（task/update、open-task/evaluate，workspace.tsx:148-234）、`hero.tsx`（GREETING + 测验快照，hero.tsx:14, 135-138）、`submission.tsx`（提交 + 评测链）、`use-instructor-stream.ts`（SSE 客户端，use-instructor-stream.ts:57, 184-234）。

## 5. 存储在哪里、什么 schema

四层：

1. **内存/文档态**：`PBLProjectV2` 整体挂在 scene.content.projectV2 上。注意**文档持久化前会剥离全部 learner state**——`preparePBLScenesForDocumentPersistence` 把 submissions/evaluations/engagementEvents/threads 消息/画像全部清空、状态重置回设计模板（document-persistence.ts:32-45，learner-state.ts:126-178）。即 scene.content 里只存"设计模板 + 进度状态"，行为数据不在文档里。
2. **RuntimeStore（行为数据的家）**：客户端 drainer 把两个账本的事件按 `(stageId, sceneId, learnerKey)` 设备级水印增量追加（drain.ts:242-307，水印 key `runtime.pblDrain.*` 存 localStorage/KV，drain.ts:61-63, 226-232）。默认后端是浏览器 IndexedDB 库 `maic-runtime`（lib/runtime/store.ts:1-11, 26, 35-45）；当 `NEXT_PUBLIC_PERSISTENCE=1` 时 bootstrap 换成 `HttpRuntimeStore` 走 `/api/persistence`（lib/persistence/bootstrap.ts:52-63），服务端对应 PG 后端，表为 `runtime_sessions` 与 `runtime_records`（packages/@openmaic/storage/src/runtime/pg.ts:118, 134）。
3. **记录 schema**：三种 payload——`pbl_runtime_event`（事件 + 可选 attachment 快照）、`pbl_engagement_event`（纯事件）、`pbl_snapshot`（整份 `PBLLearnerState` + epoch + 锚点，hydration.ts:115-154），version 均为 1（record-payloads.ts:17, 48-77）。会话以 `pbl-{stageId}-{learnerKey}` 为确定性 id（drain.ts:65-67, 155-187）。`PBLLearnerState` 即"学习者状态"的正式 schema：uiPhase、status、各里程碑/微任务状态 + internalAssessment + completionReason + engagement 缓存、submissions、evaluations、threads、engagementEvents、proficiencyAssessment、pendingHandover/TaskCompletion（learner-state.ts:45-57）。
4. **回放**：`foldPBLRuntime` 从 records 重放出 learner state（fold.ts:37-45），hydration 时与文档态对账，不一致则自愈写 snapshot（hydration.ts:234-310）。语义是 at-least-once + 按事件 id 去重（drain.ts:1-19）。

学习者身份：默认匿名设备级 learnerKey（drain.ts:32 `WATERMARK_SCOPE='device'`；learner-key 解析 lib/runtime/learner-key.ts），bootstrap 可被替换（bootstrap.ts:56-63）。

## 6. 采集的数据被谁消费

1. **评估 agent（最直接消费者）**：三级评测 prompt 都吃这些数据——任务评测吃最新 submission 文本/文件（submission.ts:79-162）、里程碑/结项评测吃 `formatProjectEngagementRollup`（按里程碑聚合的时长/轮数/错误/概念，eval-prompts.ts:224-316）和 `formatProjectSynthesisChecks`（eval-prompts.ts:334-403）；结项 prompt 固定包含 engagement rollup + synthesis checks 两个 section（eval-prompts.ts:559-564）。情景剧结项则吃完整 role-play transcript（eval-prompts.ts:417-433）和 hidden `successWhen` 目标覆盖度。
2. **结项报告页**：`computeCompletionStats` 纯确定性从 engagement 缓存与事件算出概念解锁、独立率（concept_unlocked / 全部证据事件）、总错误/轮数/时长、最难里程碑等（completion-stats.ts:1-8, 28-51），渲染于 completion.tsx:678-683。
3. **自适应教学决策**：proficiency 画像决定 Instructor system prompt 的 tier-guidance 档位（types.ts:400-402 "derives Instructor guidance block"；adjust_difficulty 立即生效 instructor.ts:1476-1481），画像迁移史留给结项报告说"从 intermediate 学到 advanced"（types.ts:381-383）。
4. **流程门禁**：`milestoneSynthesisSatisfied` 用 stage_synthesis_check / closing_check 事件作为里程碑封印证据（engagement.ts:155-185）；情景剧 act 完成要求该 act 至少有一条学习者消息（progress.ts:667-678）；任务评测 ≥60 分才允许推进（task-completion.ts:18-26，前端 submission.tsx:536-568）。
5. **回放/恢复**：hydration 折叠出学习者状态用于跨设备/跨会话恢复（hydration.ts:234-310）。

## 7. 与文档/旧设计的漂移（以代码为准）

以下类型与文档描述存在、但**当前无生产写入方**，引用它们作结论时需谨慎：

- `closing_check`、`stage_synthesis_check`：types.ts:198-204 的注释仍描述 `record_closing_check` 工具 + `advance_micro_task` 门控，schemas.ts:17-57 还留着这两个工具的 zod schema，evaluation.ts:4-8 的注释也还在——但 Instructor 现在只挂 `record_observation`/`adjust_difficulty` 两个工具（instructor.ts:1416-1422, 1423, 1472；schemas.ts:1-8 自己的头注释也承认了这一点），提交评测链取代了旧的"closing check 门控推进"。这两个事件仍被消费（eval-prompts.ts:350-359 作 fallback、milestoneSynthesisSatisfied），属于"读侧兼容"。
- `microtask_skipped`：纯遗留类型。
- `record_observation` 的 `concept_unlocked`：旧设计里 Instructor 可记录概念解锁，现改为提交评测通过后的确定性写入（task-completion.ts:166-175）。
- 仓库 `NOTES.md:5` 独立记录了同样的漂移（写于 2026-09-20），与本报告核实结果一致。

## 8. 证据不足 / 未覆盖

- **服务端是否另有遥测**：`app/api/usage`、`lib/usage` 存在，但本次未深入核实其与学生行为数据的关系（从命名看是 LLM 用量计量，大概率无关，未确认）。
- **媒体字节**：文件类 submission 的 `fileUrl` 指向素材池（asset pool），字节本身不在 PBL 数据 schema 内；素材池的存储细节未展开。
- **跨设备合并**：`configureRuntimeStorage` 注释提到 `mergeLearner` 流程由应用层负责（lib/runtime/config.ts:30-40），具体实现在本次调查范围外。
- **报表/管理端消费**：除结项报告页与 evaluator prompt 外，未发现教师端 dashboards 类消费方（可能存在但未检索到）。
- **PG 模式的部署开关**：`/api/persistence` 走 PG 需要 `NEXT_PUBLIC_PERSISTENCE=1`（bootstrap.ts:26-28, 52），默认纯浏览器 IndexedDB；生产实际启用情况无法从代码判断。

## 9. 附：关键文件索引

| 关注点 | 位置 |
|---|---|
| 事件/画像/产出类型定义 | lib/pbl/v2/types.ts:35-226, 336-448, 539-554 |
| 事件账本内核（recordEvent/聚合/上限） | packages/@openmaic/generation/src/pbl/operations/kernel/engagement.ts |
| Instructor agent（工具、learner_turn） | lib/pbl/v2/agents/instructor.ts:1282-1483 |
| Simulator agent（情景剧 learner_turn） | lib/pbl/v2/agents/simulator.ts:474-498 |
| 进度操作（opened/completed/缓存） | packages/@openmaic/generation/src/pbl/operations/kernel/progress.ts:424-812 |
| 提交/评测写入 | lib/pbl/v2/operations/runtime/submission.ts, evaluation.ts |
| 动态信号管线 | lib/pbl/v2/operations/runtime/dynamic-signals.ts |
| API 路由 | app/api/pbl/v2/{instructor,open-task,simulator,evaluate,task/update}/route.ts |
| SSE patch 协议 | lib/pbl/v2/api/sse.ts |
| 客户端 drain / hydration / fold / learner-state | lib/pbl/v2/runtime/{drain,hydration,fold,learner-state,record-payloads,document-persistence}.ts |
| RuntimeStore 后端 | lib/runtime/store.ts, lib/persistence/bootstrap.ts, packages/@openmaic/storage/src/runtime/{browser,http,pg}.ts |
| 消费端 prompt 构建 | lib/pbl/v2/operations/runtime/eval-prompts.ts |
| 结项统计 | lib/pbl/v2/operations/runtime/completion-stats.ts |
