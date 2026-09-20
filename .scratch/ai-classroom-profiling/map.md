# 地图：AI 课堂交互采集与学生画像设计蓝图

Type: wayfinder:map
Status: active

## Destination

一份中文设计蓝图报告（纯文字、不提代码）：为单课程理工科 AI 课堂（大学生；教师上传课件，AI 在其后发挥作用）设计"交互采集 → 学生画像 → 自适应课堂"的完整闭环——采集什么、画像怎么建、画像怎么反哺课堂（基础薄弱者补基础巩固、学得快者加速加深）、闭环如何评估；分 MVP 与远期；相关章节附 OpenMAIC 对照。终点 = 报告撰写完成并经用户确认。

## Notes

- 产品形态：左侧课件（视频/PPT/PDF，教师上传），右侧 AI 助教问答；已有基础 demo（demo 非重点，报告面向设计）。
- 核心痛点（用户原话的提炼）：OpenMAIC 画像太浅（学历+兴趣、单轴难度 tier）；问答数据完全不进画像；个性化停留在 Token 级改写，课堂无本质优化。
- 关键参照：`reports/maic-interaction-collection-and-profiling.md`（OpenMAIC 调研报告，论文↔代码对照已完成）、`MAIC.md`（原论文）、本仓库源代码（事实核查用）。
- 已在 charting 确认的决策：L2 内容级自适应为主目标、L1 对话级为地基顺带覆盖、L3 路径级写远期、L4 排除；知识图谱做到概念级；有人类教师（课件教师上传）但教师端非本报告重点。
- 术语约定：「画像」= 多维、随学习演进的学生模型（区别于 OpenMAIC 单轴"熟练度 tier"）；L1 对话级 / L2 内容级 / L3 路径级自适应；「闭环」= 采集 → 画像 → 课堂改变 → 效果评估 → 回调采集与策略；「事件信封」= 全部采集事件共用的统一字段头（T1）；「派生层」= 从原始事件可重算的指标/标签，不在采集时锁死（T1）。
- 工作方式：核心决策逐轮 grilling 拍板（grilling 票会话开场调 Skill: grilling + domain-modeling）；事实调研走 research 子代理（research 票调 Skill: research）。
- 本 effort 携带执行：终点票 T7 实际撰写报告（"做"仅限报告本身，不写产品代码）。

## Decisions so far

<!-- 一行一条： [票名](相对链接): 结论要点 -->

- [R1：MAIC 论文画像与个性化机制精读](issues/01-maic-paper-profiling-deep-read.md): 论文画像管线很浅——对话采集 agent 收专业/年级+兴趣，summarization 出 Domain/Category 标签，仅供 token 级改写；10 万+行为记录无字段定义；MsgNum/MsgLen 与成绩正相关；个性化效果无对照实证。细节见 research/01-maic-paper-profiling.md
- [R2：对话式学生建模的学术机制调研](issues/02-dialogue-student-modeling-research.md): 对话建画像三层机制——静态身份标签（对话采集+重提炼）、行为构成（dialogue act 分类，facilitative 提问提升学习率、直接给答案为负）、状态估计（LLM 从对话原文出逐知识点 mastery、6 认知状态→策略查表）；最有预测力信号轴是"概念性 vs 任务特异性提问"。细节见 research/02-dialogue-student-modeling.md
- [R3：视频与在线学习行为采集实践调研](issues/03-video-behavior-collection-research.md): xAPI Video Profile 与 Caliper MediaEvent 是埋点事实标准；首看/重看须分开解释；停留时长须细粒度+可见性过滤；改答案首次净收益为正；MOOC 预测共识特征族=每周活跃天数、视频完成率、提交及时性、CFA；附最小有用采集集共识。细节见 research/03-video-behavior-collection.md
- [T1：交互采集清单与事件模型](issues/04-interaction-collection-event-model.md): 统一事件信封（学习者/会话/时间戳/资源定位/类型/载荷）；问答存全量原文+课件上下文（标签为派生层）；视频采 xAPI 子集；课件采页级翻页+可见停留；测验采逐题用时+修改轨迹；时长/活跃天数/完成率全部派生；不采鼠标级行为；账号制，教师只见聚合层

## Not yet specified

- 情感/动机维度（困惑、挫败、投入）是否进画像：文献提示需显式检测器、成本高；待 T2 会话判断进 MVP、远期还是排除。
- 画像对学生可见的字段与呈现（学情面板外露什么）：待 T2 细化。
- 教师端的学情消费（教师能看到什么）：用户判定非重点，但是否在报告中留远期一节，待 T6/T7 定。
- L3 路径级自适应在报告中写多深：待 T5 结果决定。
- 防标签固化/画像纠错机制的深度：并入 T5 还是独立，待 T5 会话判断。

## Out of scope

- L4 模型级闭环（用交互数据训练/微调模型）——用户明确排除。
- 跨课程画像联动——单课程平台，用户明确排除。
- 课堂形态设计（多 agent 同学、课件编辑器、教师上传流程）——demo 已有或用户判定非重点。
- 产品代码实现——本 effort 只产出文字报告。
