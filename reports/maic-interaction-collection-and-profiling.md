# OpenMAIC 交互采集与学生画像调研报告

> 调研对象：OpenMAIC 开源代码库（清华 MAIC 论文《From MOOC to MAIC: Reimagine Online Teaching and Learning Through LLM-Driven Agents》，JCST 2026 的开源实现）
> 调研范围：学生交互数据的采集（采集了什么、怎么采集）、基于采集数据的学生画像构建；论文与代码的逐节对应关系；相关学术工作对比
> 日期：2026-09-19（第二版：补充逐节详细对照 + 扩展相关论文；论文检索使用 kimi-datasource scholar 数据源）

---

## 1. 总览

论文描述的理想闭环：

```
课堂交互 → 行为记录（10 万+ 条） → 认知学生建模（对话采集 + summarization agent → 结构化标签画像）
        → Token 级个性化改写（RAG + Bloom/ZPD/UDL） → 课堂改进
```

开源代码的整体状态：**采集层和课堂调度层基本落地，画像层和个性化改写层大幅简化或缺失**。逐章判定：

| 论文章节 | 判定 | 一句话说明 |
|---|---|---|
| 3.1.1 多模态内容抽取 | 🟡 部分一致 | PDF 文本+图片、音视频 ASR 能力都在，但分属两条管线，非统一 (R_t, R_v) 抽取 |
| 3.1.1 知识库构建 K | ❌ 缺失 | `lib/rag/` 是未接线的词法索引 infra，无向量检索、无 taxonomic 知识关系 |
| 3.1.2 课程组件生成 | 🟡 部分一致 | Canvas/Quiz/讲授脚本齐全且超出论文（interactive/pbl），但 LectureScript 不是独立组件类型 |
| 3.1.2 Agent 生成 | 🟡 部分一致 | 教学 agent 档案 + 声音克隆 ✅；补充材料走"工具式全文访问"而非 RAG |
| 3.2.1 认知学生建模 | ❌ 缺失 | 退化为手填 nickname/bio；唯一的学生状态估计是 PBL EWMA 熟练度引擎 |
| 3.2.2 Token 级个性化 | ❌ 缺失 | 无向量库 top-k、无讲稿改写管线、prompt 中无 Bloom/ZPD/UDL |
| 3.3.1 Schwanke 行为分类 | ❌ 缺失 | 代码中无 TI/ID/EC/CM 任何痕迹，行为覆盖靠角色 persona 隐式实现 |
| 3.3.2 四个同学 agent | ✅ 一致 | 全部存在（中文化改名），支持用户自定义增删；无论文中的角色标签标注 |
| 3.3.3 Manager agent | ✅ 一致 | Director 实现完整，新旧两代（pi 运行时 / LangGraph） |
| 3.3.4 Cooperative Tasks | 🟡 演进 | milestones ✅；counselor agent 演进为 Instructor + 披露阶梯 + 熟练度引擎；"部分状态暴露"演进为 simulator 角色扮演模式 |
| 4.1 讲稿生成评估 | ❌ 缺失 | eval/ 中无内容生成质量评测 |
| 4.3 Manager 精度评估 | 🟡 部分一致 | eval/orchestration 是合成场景回归 harness，非 500 条真实决策人工标注 |
| 5.1 七类行为分类 | ❌ 缺失 | 原始数据可支撑事后计算，但无任何行为分类代码 |
| 5.2 测验与问卷 | 🟡 部分一致 | quiz 三阶段系统可充当模块测验；baseline test / 问卷 / 前后测无对应 |

---

## 2. 论文 ↔ 代码逐节详细对照

### 2.1 论文 3.1 MAIC-Craft（课程制备）

**Read 阶段 · 多模态内容抽取 f_T¹**：论文主张 VLM 提视觉 + ASR 转音频 + 文档解析提文本，统一管线输出 (R_t, R_v)。

- 文档解析：`app/api/parse-pdf/route.ts`（multipart 上传 → `lib/document` 抽取器注册表）；`lib/server/material-extraction/extract.ts:195-261`（文档 → markdown 衍生品）
- 音视频：`lib/server/material-extraction/extract.ts:107-193`（带时间戳 transcript + 关键帧图片）；`app/api/transcription/route.ts`（ASR 供应商）
- 视觉进生成管线：`lib/server/classroom-generation.ts:56`（`pdfContent: {text, images}`）→ `packages/@openmaic/generation/src/outline-generator.ts:44-77`（PDF 图片按 `MAX_VISION_IMAGES` 截取送 MLLM）
- 🟡 **判定**：能力分散存在但非统一管线——PDF 直接进课堂生成；音视频抽取服务 workbench agent 会话材料，不是课堂生成的一等输入。

**Read 阶段 · 知识库构建 f_T³**：论文主张 MLLM 生成教学感知描述 D_i + 抽取 taxonomic 知识库 K。

- ❌ **判定**：`lib/rag/` 有 KnowledgeIndex 抽象和纯词法内存索引（`providers/in-memory-lexical-index.ts:115`），但无任何调用方（仅 tests 引用），无向量嵌入/余弦检索、无 taxonomic/先修关系。

**Plan 阶段 · 课程组件生成**：论文定义组件 (type, content, metadata)，三类 Canvas / Quiz / LectureScript。

- 实际场景类型：`packages/@openmaic/dsl/src/stage.ts:22` — `'slide' | 'quiz' | 'interactive' | 'pbl'`
- Canvas → 白板动作集（`lib/orchestration/registry/store.ts:29-42`）；Quiz → `lib/quiz/runtime.ts`；LectureScript → 非独立组件，内嵌为 slide 场景的动作表示语言（`packages/@openmaic/generation/templates/slide-actions/system.md`，text 讲授语 + action 指令交错 JSON），TTS 由 `lib/server/classroom-media-generation.ts:295-312` 合成
- 🟡 **判定**：功能齐全且超出论文（interactive 支持 3D/仿真/编程，另有 pbl），但 schema 中没有 LectureScript 类型。

**Plan 阶段 · Agent 生成**：论文主张定制 teacher/TA（教学风格、声音），补充材料分块经 RAG 接入。

- Agent 档案生成：`lib/server/classroom-generation.ts:130-180`（`generateAgentProfiles`，LLM 按课程内容生成 teacher/assistant/student 档案）；`app/api/generate/agent-profiles/route.ts`
- 声音：`app/api/generate/voice/route.ts`（音色注册/克隆，`lib/audio/qwen-voice-clone`）
- 教学风格迁移（开源版独有）：`skills/agent-runtime/teacher-style-clone/SKILL.md`——从教师录像/讲义抽取风格再授课
- 补充材料：❌ 无 RAG。替代为工具式全文访问 `lib/server/agent-runtime/material-tools.ts`（`read_material`/`search_material`，字面 substring 搜索，8000 字符窗口）
- 🟡 **判定**：agent 定制（含声音）成立；材料接入方式从"向量 RAG"退化为"词法搜索工具"。

### 2.2 论文 3.2 自适应引擎（本报告关注点，详见第 4 节）

- 3.2.1 认知学生建模：❌ 对话采集 agent + summarization agent + 结构化标签全部不存在
- 3.2.2 Token 级个性化：❌ 无检索增强改写管线；Bloom/ZPD/UDL 仅以教学设计 skill 文档形式存在（`skills/agent-runtime/zone-of-proximal-development/` 等），且 ZPD skill 明确拒绝产出量化学生模型
- 实际替代物：PBL v2 EWMA 熟练度引擎（确定性代码计分 + LLM 观察分类），见第 4.2 节

### 2.3 论文 3.3 多智能体课堂

**3.3.1 Schwanke 四类行为（TI/ID/EC/CM）**：❌ 全库无 TI/ID/EC/CM 常量或分类逻辑。行为覆盖通过 teacher/assistant/student 三种 role（`lib/orchestration/registry/types.ts`）+ persona prompt 隐式实现。

**3.3.2 四个预设同学 agent**：✅ 全部存在，中文化改名（`lib/orchestration/registry/store.ts`）：

| 论文 | 代码 | 位置 |
|---|---|---|
| Class Clown | 显眼包 | store.ts:96-119 |
| Inquisitive Mind | 好奇宝宝 | store.ts:120-143 |
| Note Taker | 笔记员 | store.ts:144-167 |
| Deep Thinker | 思考者 | store.ts:168-191 |

英文名在 `lib/i18n/locales/en-US.json:1195-1198`。差异：论文给每个 agent 标注 (TI,EC,CM) 等角色映射，代码中无此显式标注，用 priorities（4-6）替代做调度权重；支持用户自定义增删（registry CRUD）。

**3.3.3 Manager agent**：✅ Director（`lib/chat/pi/director-loop.ts:29`），工具仅 `read_scene / call_agent / close_session / cue_user`；状态消费对应论文 S_t：对话摘要（H_t）+ 白板动作计数（P_t 增量）+ agent 角色集合 + 学生画像段。旧版 LangGraph：`lib/orchestration/director-graph.ts`。

**3.3.4 Cooperative Tasks / MAIC-PBL**：🟡 开源版明显演进：

- 任务结构 ✅：milestones + microtasks（论文的 "issues" 对应 legacy 版 `lib/pbl/legacy/read.ts:110`，v2 已演进为两级）
- counselor agent → 🟡 无独立 counselor，由 Instructor agent 承担：4 级披露阶梯（`lib/pbl/v2/agents/tier-guidance.ts:42-46`：L0 讲为什么 → L3 直接给答案）+ EWMA 熟练度引擎做自适应支架。功能等同论文 "adaptively adjusts scaffolding"，机制是 prompt 规则 + 事件账本而非独立监控 agent
- peer agents 部分状态暴露 → 🟡 演进为 simulator 角色扮演模式（`lib/pbl/v2/agents/simulator.ts`，prompt 要求"不透露角色不会分享的隐藏信息"，`simulator.ts:358` facts-to-uncover 按需揭示）
- 开源版独有：engagement 事件账本、evaluator agent（milestone/final 评测）、proficiency 引擎

### 2.4 论文第 4 章 技术评估

- 4.1 讲稿生成评估（20 个 PPT、iterative/direct prompting 基线、content/coherence/pedagogy 三指标）：❌ eval/ 中无任何对应。`eval/outline-language/` 测的是语言指令推断（开源版功能，论文未述及）
- 4.3 Manager agent 精度（500 条真实课堂决策人工标注、role description 消融）：🟡 `eval/orchestration/` 是同思路的合成回归 harness——`prompt-variants.ts:40-63` 做模板规则剥离消融（含"规则 13 未回答问题路由"消融，对应论文的 role description 消融思路），但场景是合成匿名样例，非真实标注数据
- 开源版独有 eval：`eval/pbl-v2-planner/`（planner 质量）、`eval/whiteboard-layout/`（VLM 白板布局打分）

### 2.5 论文第 5 章 实证研究

- 5.1 七类学生活动分类（asking questions / initiating ideas / responding / negotiating / regulating AI roles / regulating class process / sharing emotion）：❌ 代码中无任何行为分类逻辑。原始数据（带时间戳的消息、engagement 事件）在 PG 中可支撑事后计算，但无分析代码
- observational vs interactive mode、MsgNum/MsgLen：🟡 数据可支撑（聊天记录按 learner_key 分区存储，engagement 账本有 `learner_turn{chars}`），无统计代码。注意产品里的 "Interactive Mode" 是课堂生成功能开关，与论文的"观察/互动学习模式"无关
- 5.2 baseline test / module test / 问卷：🟡 quiz 三阶段系统（draft→submitted→reviewed）结构上可充当模块测验；baseline test、final exam、技术接受度问卷、高阶思维前后测均 ❌ 无对应代码

---

## 3. 交互采集：采集了什么、怎么采集

### 3.1 四类数据源

**A. PBL 课堂 engagement 事件账本（最核心的学习行为数据）**

追加式事件流，每条 `{ id, kind, microtaskId?, milestoneId?, ts, payload? }`，环形缓冲上限 500 条（`lib/pbl/v2/types.ts:216-226`）。

| 事件 kind | payload | 含义 |
|---|---|---|
| `learner_turn` | `{ chars }` | 学生每发一条消息，记录字符数（≈论文的 MsgNum/MsgLen 指标） |
| `observation_error / struggle / question` | `{ signature, label?, note? }` | Instructor agent 观察到的错误/卡壳/提问；`signature` 是机器标签（如 `undefined_variable`），同一任务内同 signature 计为重复错误 |
| `observation_concept_unlocked` | `{ signature, label? }` | 学生独立掌握某概念 |
| `microtask_opened / completed / skipped` | `{ reason? }` | 任务生命周期，配合时间戳算耗时 |
| `proficiency_changed` | `{ from, to, reason, score, confidence }` | 难度档调整记录 |

`closing_check` / `stage_synthesis_check` 的 schema 仍在（`lib/pbl/v2/operations/runtime/schemas.ts:19-57`），但 Instructor 当前只暴露 `record_observation` 和 `adjust_difficulty` 两个工具（`lib/pbl/v2/agents/instructor.ts:1496-1499`），属遗留类型。

聚合层 `PBLEngagementSummary`（`types.ts:57-78`）：`startedAt, completedAt, durationSeconds, learnerTurnCount, errorCount, repeatErrorCount, errorSignatures[], conceptsUnlocked[], struggles[], questionsRaised, closingQuality` 等。

**B. 经典课堂聊天：消息即上下文**（`app/api/chat/pi`，stateless）。每条学生消息携带（`lib/types/chat.ts:330-380`）：

- 完整消息历史 + `storeState`（当前页 `currentSceneId`、所有场景、课程大纲、模式、白板状态）
- `quizResults`：当前页测验作答明细 `{ answers, results: [{ questionId, correct, earned, aiComment }] }`
- 课件状态快照：交互课件通过 `<script type="application/json" data-maic-observation>` 自报内部状态；前端每次发消息都重新采样（`components/chat/use-chat-sessions.ts:395-407`；postMessage 协议 `lib/interactive/observation-bridge.ts:35`，32KB / 800ms 限制），附 scene HTML 的 SHA-256 哈希
- 元素引用：学生点选课件元素提问时附带该元素的 DOM 摘要（`lib/chat/pi/element-reference.ts`）

**C. 测验 attempt 三阶段记录**（`lib/quiz/runtime.ts:252`）：`draft → submitted → reviewed`，按 `quiz-attempt:<stageId>:<sceneId>:<learnerKey>` 分区。不记录逐题用时。

**D. PBL runtime 事件（13 种）**（`types.ts:253-320`）：消息创建、工具调用开始/成功/失败、提交、评测、状态变更、`proficiency_updated` 等，带 actor 信息，用于 fold 重放与审计。

**未采集的**：翻页埋点、打断事件、页面停留时长、逐题用时、光标/滚动。

### 3.2 采集机制的三个刻意设计

1. **事件产生在服务端 agent，不是前端埋点**：PBL 前端只发"项目状态 + 学生消息"，由 Instructor agent 调用 `record_observation` 产生事件——LLM 负责"从对话中识别值得记录的学习时刻"。
2. **学习者身份是设备匿名 key**（`anon:<uuid>`，`lib/runtime/learner-key.ts:31`），无账号绑定。
3. **at-least-once 追加日志**：前端 drainer（`lib/pbl/v2/runtime/drain.ts`）按水位线归并两类账本写入 PG `runtime_records`（JSONB，按 `(stage_id, learner_key)` 分区）；缓冲滚掉旧事件时重放去重。文档保存时剥离学习者状态（`stripToDesignTemplate`），可完整 fold 重放（`lib/pbl/v2/runtime/fold.ts:323-382`）。

### 3.3 存储

Postgres，无 ORM（`packages/@openmaic/storage`）：`runtime_sessions` / `runtime_records`（学习者运行时数据）、`document_stages / document_scenes / document_outlines`（课程模板）、`agent_sessions / agent_session_events / agent_session_entries`（workbench 后台 agent 会话）。另有 `data/usage/*.jsonl` 资源用量日志（非学习行为）。PG 契约由 `scripts/assert-pg-contract-suites.mjs` 守护。

---

## 4. 学生画像：三块数据的实际构成

论文 3.2.1 的"对话采集 → summarization agent → 结构化标签画像"在开源版不存在。实际"画像"由三块构成：

### 4.1 手填身份（全局、静态）

`UserProfileState { avatar, nickname, bio }`（`lib/store/user-profile.ts:32-40`），手动填写，存 zustand persist KV，不进数据库，不随学习演进。消费：注入大纲生成 prompt（`outline-generator.ts:89-92`）、课堂 agent 与 Director 的 system prompt（`prompt-builder.ts:82-87`、`director-prompt.ts:61-68`）、PBL planner 的初始评估。

### 4.2 Per-course 熟练度模型（唯一的"知识状态估计"）

核心：`packages/@openmaic/generation/src/pbl/operations/kernel/proficiency.ts`（893 行纯代码）。`PBLProficiencyAssessment = { tier: beginner|intermediate|advanced, score∈[-1,1], confidence, signals[](上限50), transitions[] }`。

**三阶段演进**：

1. **Planner 时（静态）**：大纲关键词词表（±0.1/词）；`analyzeBio` 正则（`proficiency.ts:297`：N 年经验 +0.4~+0.8、"博士/架构师" +0.8、"零基础" −0.8）；`detectExplicitProficiency`（:339：自报等级三档词表，命中即短路）。聚合用 shrinkage 加权均值 `score = clamp(加权均值 × Σwt/(Σwt+0.7), ±1)`
2. **进入场景时**：折叠设备历史 quiz 正确率快照（`(acc−0.5)×2`），可绕过门限直接调档（`applyQuizSnapshot` :811）
3. **运行时（动态）**：LLM 只把观察分类成 kind + signature，方向分和权重全部硬编码——首次错误 −0.4、重复错误 −0.7、卡壳 −0.5、提问 −0.3、概念解锁 +0.5、task_speed（≤2 轮 +0.5，>10 轮 −0.5）、submission_score `(score/100−0.5)×2`。EWMA 更新 `newScore = 0.2·dir·wt + 0.8·score` + 滞后边界（进 advanced >0.50 / 出 <0.20）+ 置信度门限（≥0.4）+ 5 回合冷却。学生明说"太难了"视为 ground truth 直接改档

**生命周期**：存于 PBL learner-state，重置进度刻意保留；对学生不可见（产品决策）；per-course 作用域，无跨课程全局模型。

### 4.3 Per-project 过程性聚合

`computeCompletionStats`（`lib/pbl/v2/operations/runtime/completion-stats.ts:124-162`，纯函数）：独立率、总错误/轮次/耗时、最难里程碑、highlights、scenario 的 goalCoverage。供最终评测 prompt 和学生端完成页消费。

### 4.4 关键设计取舍

- **"LLM 观察、代码计分"分离**：画像数字演进完全确定性，LLM 只做分类。可复现、可单测，但画像维度锁死在"难度/熟练度"单轴——论文的兴趣、情感、学习风格维度全部缺失
- **无汇总层**：三块数据之间没有跨课程的学生级存储或服务

---

## 5. 相关论文（按主题分组，含与 OpenMAIC 的对比点）

### 5.0 MAIC 同组的 Companion 工作（最直接可比）

**[1] SimClass: Simulating Classroom Education with LLM-Empowered Agents** — Zhang, Zhang-Li, Yu, Gong, Zhou 等（清华），NAACL 2025，被引 312。
MAIC 的直接前身（即 MAIC 论文引用 [44]）。提出多智能体课堂框架：识别课堂角色（教师/助教/学生）、设计 session controller 控制课堂节奏，并用 Frank 交互分析（FLanders）量化课堂话语。与 OpenMAIC 的关系：Director ≈ SimClass 的 session controller；四个同学 agent 沿袭 SimClass 角色设计。
https://aclanthology.org/2025.naacl-long.520/

**[2] AI as Learning Partners: Students' Interactions and Perceptions in a Simulated Classroom with Multiple LLM-Powered Agents** — Hao, Qin, Jiang, Cao, Yu, Liu 等，ICLS 2025。
MAIC 团队的实证研究：分析学生在多智能体模拟课堂中的交互体验与感知。与 MAIC 论文第 5 章互为补充，是"交互数据采集 → 行为分析"在同组工作中的完整示范。
https://repository.isls.org/handle/1/11365

**[3] Learning in Context: Personalizing Educational Content with Large Language Models to Enhance Student Learning** — Lim, Zhang-Li, Yu, Cong, He, Liu 等，2025，arXiv 2509.15068。
MAIC 论文 3.2 自适应引擎的专门展开（MAIC 正文所说 "thoroughly evaluated in concurrent academic investigations"）：对话式构建学生画像 + 个性化教育内容生成，含学生 profile 示例。**注意：该文描述的画像管线在 OpenMAIC 代码库中同样缺失**——说明开源版与论文体系的差距是系统性的，不只是 3.2 节。
https://arxiv.org/abs/2509.15068

### 5.1 交互数据采集与学习分析

**[4] The StudyChat Dataset: Analyzing Student Dialogues With ChatGPT in an Artificial Intelligence Course** — McNichols, Ikram, Lan，LAK 2026。
真实 AI 课程中学生与 LLM 辅导 chatbot 的 16,851 条交互数据集，用对话行为（dialogue act）标注体系分类学生发言。与 OpenMAIC 的对比：StudyChat 是"采集 + 人工/模型标注 → 公开数据集"路线；OpenMAIC 采集粒度更细（engagement 事件带 signature 级错误标签、课件状态快照），但**没有行为分类层**——StudyChat 的 dialogue act schema 正是 OpenMAIC 补上论文 5.1 七类行为分析所需的东西。
https://dl.acm.org/doi/abs/10.1145/3785022.3785029

**[5] Combining Dialog Acts and Skill Modeling: What Chat Interactions Enhance Learning Rates During AI-Supported Peer Tutoring?** — Borchers, Yang, Lin 等，EDM 2024，被引 32。
把对话行为分类与技能建模结合，量化"哪类聊天交互真正提升学习速率"。与 OpenMAIC 的对比：OpenMAIC 的 `learner_turn{chars}` 只有量（对应论文 MsgNum/MsgLen 与成绩的相关性分析），该工作示范了"质"的维度——对话行为类型 × 知识增长的因果/相关分析。
https://educationaldatamining.org/edm2024/proceedings/2024.EDM-long-papers.10/

**[6] Teacher-in-the-Loop Learning Analytics for LLM-Enhanced Intelligent Tutoring Systems** — Levchuk, Salinas, Hurtado 等，2026。
814 条学生-ITS 交互，12 类学生意图分类体系，教师在环验证。对比点：OpenMAIC 让 LLM（Instructor agent）自主判断记录什么事件，该工作强调教师参与标注验证——两种质量控制路线的对照。
https://api.taylorfrancis.com/content/chapters/edit/download?identifierName=doi&identifierValue=10.1201/9781003678250-11&type=chapterpdf

**[7] Learner Engagement State Typologies in AI Tutoring: A Clustering Analysis of Dialogue Behaviors in Introductory Programming Sessions** — Naga & Perez，2026。
对 AI 辅导对话行为做聚类，得到稳定的学习者参与度状态类型，并建议据此自适应调整 tutor 响应。这正是论文 5.1 "observational vs interactive mode"（13.7% vs 86.3%）的通用化版本——OpenMAIC 有数据无聚类分析层。
https://sciup.org/file/15020362/IJMECS-V18-N3-10.pdf

**[8] Chatting with a Learning Analytics Dashboard: The Role of Generative AI Literacy** — Jin, Yang, Yan, Echeverria, Zhao 等，LAK 2025，被引 56。
生成式 AI chatbot 作为学习分析仪表盘的交互入口。对比点：OpenMAIC 的学习分析出口只有学生端 completion 页，无教师端仪表盘，更无对话式分析入口。
https://dl.acm.org/doi/abs/10.1145/3706468.3706545

### 5.2 学生建模与画像

**[9] Personality-aware Student Simulation for Conversational Intelligent Tutoring Systems** — Liu, Yin, Lin, Chen，EMNLP 2024。
构建整合认知 + 非认知（大五人格）维度的学生画像框架，用于对话式 ITS 的学生模拟。对比点：证明"多维画像"（不只是知识水平）在 LLM 时代可行——正是 OpenMAIC 相对论文 3.2.1 缺失的部分（兴趣/情感/人格维度）。
https://aclanthology.org/2024.emnlp-main.37/

**[10] LLM Agents for Education: Advances and Applications** — Chu, Wang, Xie, Zhu, Yan, Ye 等，EMNLP 2025 Findings，被引 308。
LLM 教育智能体综述，明确把"维护并更新结构化学习者表示（student profile）作为 agent 记忆"列为标准架构组件。可作为"画像层应该如何架构"的框架性参照。
https://aclanthology.org/anthology-files/anthology-files/pdf/findings/2025.findings-emnlp.743.pdf

**[11] Investigating Pedagogical Teacher and Student LLM Agents: Genetic Adaptation Meets Retrieval-Augmented Generation Across Learning Styles** — Sanyal, Maiti, Maharana, Kumar 等，EMNLP 2025。
动态课堂模拟：LLM 学生 agent 按学习风格分型，遗传算法演化教师教学参数 + RAG。对比点：把"学习风格"作为一阶画像维度并用于教学策略搜索；OpenMAIC 的 tier 只有难度一维，且演进规则是手写 EWMA 而非搜索/学习。
https://aclanthology.org/2025.emnlp-main.675/

**[12] A Review of Recent Advances in Learner and Skill Modeling in Intelligent Learning Environments** — Desmarais & Baker，UMUAI 2012（经典综述，被引 300+）。
学习者/技能建模奠基文献：BKT、IRT、约束模型等。OpenMAIC 的 EWMA + 滞后门限实质上是这些经典方法的极简工程化变体。
https://learninganalytics.upenn.edu/ryanbaker/lm.pdf

**[13] The Half-Life of Cognitive-Affective States During Complex Learning** — D'Mello & Graesser，Cognition & Emotion 2011，被引 300。以及 **AutoTutor** 系列（Graesser 等，2001-2008）。
情感状态（困惑/挫败/心流）在学习中的动态与检测。对比点：论文 3.2.1 提到 "affective features (e.g., interests, hobbies)"，但 OpenMAIC 完全没有情感状态采集/建模；该线工作说明情感维度需要显式检测器（多模态或对话线索），不是 LLM 顺手能做的事。
https://www.tandfonline.com/doi/abs/10.1080/02699931.2011.613668

### 5.3 对话中的知识追踪（交互 → 知识状态）

**[14] Exploring Knowledge Tracing in Tutor-Student Dialogues Using LLMs** — Scarlatos, Baker, Lan，LAK 2025。
直接用 LLM 从导师-学生对话估计学生知识状态，打通"对话日志 → 知识追踪"链路，不依赖结构化答题数据。对比点：OpenMAIC 的知识状态估计只走"结构化信号（quiz 分、submission 分、LLM 观察标签）→ EWMA"路线；该工作证明对话原文本身可作为知识追踪输入——OpenMAIC 的 threads 全量对话都存了，具备这样做实验的数据条件。
https://arxiv.org/abs/2409.16490

**[15] Faster, Cheaper, More Accurate: Specialised Knowledge Tracing Models Outperform LLMs** — Bhattacharyya, Mitton, Abboud 等，2026，arXiv 2603.02830。
专门训练的 KT 模型在预测学生作答上优于通用 LLM。对 OpenMAIC 的启示：其"LLM 分类 + 确定性计分"的混合架构与该结论方向一致——LLM 不直接估计数值状态；也提示若要更强的知识状态预测，可在已采集的 engagement/quiz 数据上训练专门模型。
https://arxiv.org/abs/2603.02830

### 5.4 学生模拟（画像的验证与数据生成）

**[16] Classroom Simulacra: Building Contextual Student Generative Agents in Online Education for Learning Behavioral Simulation** — Xu, Wen, Pan, Dominguez, Hu, Zhang，CHI 2025，被引 46。
基于真实在线课堂背景构建生成式学生智能体，模拟学习行为。与画像的关系：学生 agent 的保真度依赖底层学生模型的质量——可视为"画像驱动行为生成"的反向验证工具。
https://dl.acm.org/doi/abs/10.1145/3706598.3713773

**[17] Agent4Edu: Generating Learner Response Data by Generative Agents for Intelligent Education Systems** — Gao, Liu, Yue, Yao, Lv, Zhang, Wang, Huang（中科大），AAAI 2025。
用 LLM agent 生成学习者作答数据，服务个性化系统的数据增强。对比点：当真实交互数据不足（冷启动）时，合成数据可训练/校准学生模型——对 OpenMAIC 补画像层时的冷启动问题有参考价值。
https://arxiv.org/abs/2501.10332

**[18] When LLMs Learn to Be Students: The SOEI Framework for Modeling and Evaluating Virtual Student Agents** — Ma, Hu, Li, Wang, Chen, Liu 等，2024，arXiv 2410.15701。
虚拟学生 agent 的建模与评估框架，强调超越 prompt 级模拟、逼近学生认知与情感反应。
https://arxiv.org/abs/2410.15701

### 5.5 画像 → 个性化教学闭环

**[19] SocraticLM: Exploring Socratic Personalized Teaching with Large Language Models** — Liu, Huang, Xiao, Sha, Wu, Liu, Wang, Chen（中科大+讯飞），NeurIPS 2024。
SocraTeach 数据集（35k 多轮教学对话，模拟 6 种认知状态的学生），按学生认知状态自适应调整苏格拉底式教学策略。对比点：其"认知状态 → 教学策略"映射是显式的 6 态模型；OpenMAIC 的 tier→披露阶梯映射是其 3 态简化版。
https://openreview.net/forum?id=qkoZgJhxsA

**[20] Training LLM-based Tutors to Improve Student Learning Outcomes in Dialogues** — Scarlatos, Liu, Lee, Baraniuk, Lan，2025，arXiv 2503.06424，被引 86+。
用真实导师-学生对话日志训练 LLM tutor 以改进学习成效。对比点：代表"交互数据 → 训练 tutor 模型"的深度闭环；OpenMAIC 的闭环止于"交互数据 → prompt 注入"，未用数据训练任何模型。
https://arxiv.org/abs/2503.06424

**[21] EduChat: A Large-Scale Language Model-based Chatbot System for Intelligent Education** — Dan, Lei, Gu, Li 等（华东师大），2023，arXiv 2308.02773，被引 240+。
国内教育 LLM 代表作：教育语料预训练 + 苏格拉底教学、情感支持等功能。对比点：EduChat 走"领域基座模型"路线（对应 MAIC 论文 Future Work 第一条），OpenMAIC 走"通用 LLM + 工程编排"路线。
https://arxiv.org/abs/2308.02773

---

## 6. 细致对比：六维对照表

| 系统/工作 | 交互采集内容 | 画像维度 | 建模技术 | 画像反哺教学 | 与 OpenMAIC 的关键差异 |
|---|---|---|---|---|---|
| **OpenMAIC** | engagement 事件（错误/卡壳/提问 signature）、quiz 三阶段、消息+课件状态快照 | 仅难度 tier（+手填 bio） | LLM 分类 + 确定性 EWMA | 仅 tier→教学策略 prompt | — |
| MAIC 论文（宣称） | 10 万+ 行为记录 | 学术+情感，结构化标签 | 对话采集 agent + summarization agent | token 级 RAG 讲稿改写 | 论文版画像与个性化管线未开源 |
| SimClass [1] | 课堂话语流 | 无学生模型（角色固定） | — | — | OpenMAIC 的课堂编排源自此 |
| Learning in Context [3] | 对话采集学术/情感特征 | 学术+情感结构化标签 | 对话 agent + summarization | 内容级个性化改写 | 即论文 3.2 的完整版，未开源 |
| StudyChat [4] | 16,851 条全量对话 + dialogue act 标注 | 行为模式（非状态模型） | 标注 schema + 统计分析 | — | OpenMAIC 缺行为分类层 |
| Borchers EDM'24 [5] | 对话行为 × 技能掌握 | 技能掌握 | dialog act 分类 + skill modeling | — | 示范"质"维度的交互分析 |
| Personality-aware [9] | 合成对话 | 认知 + 人格多维 | LLM 模拟 + 画像框架 | 模拟驱动 | 示范多维画像可行性 |
| Sanyal EMNLP'25 [11] | 模拟课堂交互 | 学习风格分型 | 遗传算法演化教学参数 | 策略级自适应 | 画像维度含学习风格；策略是搜索出来的 |
| KT in Dialogues [14] | 对话原文 | 知识状态 | LLM 直接估计 | — | OpenMAIC 存的对话原文支持此路线 |
| SocraticLM [19] | 35k 教学对话 | 6 种认知状态 | 状态标注 + 策略训练 | 状态→教学策略 | OpenMAIC 的 3 态 tier 是其简化版 |
| Tutor 训练 [20] | 真实导师对话 | 隐式（训练进模型） | 监督训练 | 模型级闭环 | OpenMAIC 闭环止于 prompt 注入 |

## 7. 启示：OpenMAIC 补上"画像层"的可行路径

1. **行为分类层**（对应论文 5.1）：engagement 账本已有 signature 级事件，可加一个离线分类器（参考 StudyChat 的 dialogue act schema [4]、Borchers 的交互-学习关联分析 [5]）把消息映射到七类行为，落 PG 即可复现论文的参与度分析。
2. **多维画像层**（对应论文 3.2.1）：参考 Learning in Context [3] 的对话式采集和 Personality-aware [9] 的认知+非认知框架；工程上可直接复用 OpenMAIC 已有的 "LLM 观察分类 + 代码入账" 模式（`record_observation` 的扩展），汇总层落在 `packages/@openmaic/storage` 新增跨 stage 的 learner profile store。
3. **知识状态升级**（可选）：在已持久化的对话 threads + engagement 事件上，可实验 [14] 的 from-dialogue KT 或 [15] 的专门 KT 模型，替代/校准 EWMA。
4. **闭环深化**：当前闭环止于 prompt 注入；[19][20] 示范了"状态→策略训练"的模型级闭环，可作为长期方向。

---

*备注：本报告由 AI 辅助生成。论文检索使用 kimi-datasource scholar 数据源（Google Scholar），引用数为检索时快照。5.0 节三篇为 MAIC 同组工作；代码结论均附 file:line 可核查。*
