# R1：MAIC 论文画像与个性化机制精读

Type: research
Status: resolved
Blocked by: —

## Question

精读 `MAIC.md`（MAIC 原论文，From MOOC to MAIC, JCST 2026），提取与学生画像、个性化、交互数据采集相关的全部细节，供最终报告的对照章节使用：

- 3.2.1 认知学生建模：对话采集 agent 与 summarization agent 的机制、结构化标签画像的字段/维度（学术 + 情感）、更新方式。
- 3.2.2 Token 级个性化：RAG 检索、Bloom/ZPD/UDL 如何注入、改写管线的输入输出。
- 3.3 与第 5 章：10 万+ 行为记录具体是什么、七类行为分类体系、MsgNum/MsgLen 等指标定义、observational vs interactive 的划分与结论。
- 论文中画像→个性化效果的任何实证证据。
- 论文提及的 companion 工作（SimClass、Learning in Context 等）中透露的画像管线细节（仅限论文正文提及的）。

已有调研报告 `reports/maic-interaction-collection-and-profiling.md` 覆盖了论文↔代码对照；本票专注论文本身，输出"论文宣称了什么"的事实清单（标注章节号），不做设计建议。

产出写入 `.scratch/ai-classroom-profiling/research/01-maic-paper-profiling.md`。不要改动任何票或 map 文件；完成后把要点摘要返回给主会话。

## Answer

已由 research 子代理完成（2026-09-20）。产出：`.scratch/ai-classroom-profiling/research/01-maic-paper-profiling.md`。

要点：论文画像管线很浅——对话 agent 只采集专业/年级+兴趣，summarization agent 产出 Domain/Category 标签画像，仅供 token 级改写（LLM 生成查询→检索→top-k 余弦→按 Bloom/ZPD/UDL 提示词改写）。10 万+ 行为记录无字段定义；七类学生活动与 TI/ID/EC/CM 两套分类；MsgNum/MsgLen 取对数与成绩正相关（0.34 / 0.20–0.33）；86.3% 交互模式 vs 13.7% 观察模式。个性化效果仅有合成画像专家评估（relevance 92.2 vs 33.8），无对照实验。注：MAIC.md 为 MinerU 转换版，附录与画像示例 Listing A1 缺失；"Learning in Context" 在论文正文中未出现。
