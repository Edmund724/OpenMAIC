# OpenMAIC 交互采集与学生画像 — Resources

## Knowledge

- [MAIC 论文（本地 markdown）](../MAIC.md)
  《From MOOC to MAIC》JCST 2026。3.2 自适应引擎（画像/个性化）、3.3 多智能体课堂、5.1 七类行为分析是交互采集的论文对照基准。本地文件，随时可查。
- [调研报告（本地）](../reports/maic-interaction-collection-and-profiling.md)
  论文↔代码逐节对照 + 相关论文地图。注意：部分行号/描述已落后于代码（见 NOTES.md），用时需核对。
- 源码本身（`lib/pbl/v2/`、`packages/@openmaic/generation/src/pbl/`、`lib/interactive/`、`packages/@openmaic/storage/`）
  最高信任来源。lib/pbl/v2 与 packages 下的 generation/src/pbl 是同一套代码（lib 为薄封装/re-export）。
- [Learning in Context (arXiv 2509.15068)](https://arxiv.org/abs/2509.15068)
  MAIC 论文 3.2 自适应引擎的专门展开（同组工作）。借鉴"对话采集 → 结构化标签画像"的完整设计时读它。
- [StudyChat Dataset (LAK 2026)](https://dl.acm.org/doi/abs/10.1145/3785022.3785029)
  16,851 条学生-chatbot 对话 + dialogue act 标注体系。借鉴"行为分类层"设计时的参照。
- [Exploring Knowledge Tracing in Tutor-Student Dialogues Using LLMs (LAK 2025)](https://arxiv.org/abs/2409.16490)
  从对话原文直接估计知识状态。若自己的系统要用对话做知识追踪，这是路线参照。
- [Desmarais & Baker, UMUAI 2012 学习者/技能建模综述](https://learninganalytics.upenn.edu/ryanbaker/lm.pdf)
  BKT/IRT 等经典方法。OpenMAIC 的 EWMA+滞后门限是其极简工程变体，理解经典有助于判断简化是否合理。

## Wisdom (Communities)

- 暂未探索。候选方向：LAK / EDM 会议社区、Learning Analytics 相关 Discord/邮件列表。用户未表达加入意愿前不主动推。

## Gaps

- 缺少一份"事件溯源（event sourcing）在学习系统中的工程实践"的高质量资料——目前只能靠 OpenMAIC 源码本身归纳。
