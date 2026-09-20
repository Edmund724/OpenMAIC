# R2：对话式学生建模的学术机制调研

Type: research
Status: resolved
Blocked by: —

## Question

围绕"如何从学生与 AI 助教的问答对话构建学生画像"调研学术机制（用户产品的核心痛点：OpenMAIC 完全不把问答数据用于画像）。以 `reports/maic-interaction-collection-and-profiling.md` 第 5 节已列文献为起点深读：

- Learning in Context（arXiv 2509.15068）：对话式构建画像的完整管线、画像字段示例、个性化生成方式。
- StudyChat（LAK 2026）：dialogue act 标注体系——学生发言分哪几类。
- Borchers EDM'24：对话行为 × 技能建模，哪类交互真正提升学习速率。
- Personality-aware（EMNLP 2024）：认知+非认知多维画像框架的维度设计。
- KT in Dialogues（LAK 2025，arXiv 2409.16490）：从对话原文估计知识状态的方法与效果。
- SocraticLM（NeurIPS 2024）：6 种认知状态 → 教学策略的映射。

可补充检索对话式知识追踪、LLM 学生建模的最新综述；可用 kimi-datasource 的 scholar/arxiv 数据源。

对每项机制输出：采集什么信号、画像维度如何定义、如何更新、如何反哺教学、对"单课程理工科 AI 课堂（左课件右助教）"的可移植性判断。

产出写入 `.scratch/ai-classroom-profiling/research/02-dialogue-student-modeling.md`。不要改动任何票或 map 文件；完成后把要点摘要返回给主会话。

## Answer

已由 research 子代理完成（2026-09-20）。产出：`.scratch/ai-classroom-profiling/research/02-dialogue-student-modeling.md`（6 篇全文深读 + 2 篇综述，按文献分节 + 机制对比表）。

要点：对话建画像可归纳为三层机制——① 静态身份层（PAGE：学术+兴趣标签 JSON，对话式采集+周期性重提炼）；② 行为构成层（StudyChat 对话行为分类，LLM 打标与人一致；Borchers 证实 facilitative 提示提升学习率、直接给答案为负相关）；③ 状态估计层（LLMKT 从对话原文输出逐知识点 mastery；SocraticLM 6 种认知状态→教学策略查表）。最具预测力的信号轴是"概念性 vs 任务特异性提问"与答错/跑偏检测。反哺深度按 prompt 注入 → 状态查表 → 微调模型递进。
