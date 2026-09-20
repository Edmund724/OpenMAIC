# T3：画像构建机制——问答对话如何进画像

Type: grilling
Status: open
Blocked by: 02, 05

## Question

定画像的构建与更新机制，重点是用户的核心痛点：学生与 AI 助教的问答对话如何转化为画像。候选机制（来自 R2 调研）：LLM 观察分类 + 确定性入账（OpenMAIC 模式的扩展）、周期性 summarization agent（MAIC 论文模式）、对话行为分类、从对话原文估计知识状态。定：MVP 用哪种或哪几种组合、更新时机（实时/课末/阶段性）、置信度与纠错机制、冷启动（新生第一课的画像从哪来：摸底测验/自报/默认值）。

参照：`.scratch/ai-classroom-profiling/research/02-dialogue-student-modeling.md`；OpenMAIC"LLM 观察、代码计分"模式见调研报告 4.2 节。会话开场调 Skill: grilling + domain-modeling。
