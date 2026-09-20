# NOTES

- 用户背景：已读过 reports/maic-interaction-collection-and-profiling.md（自己让 AI 生成的调研报告），现在要求逐节深入。
- 教学语言：中文。
- 重要：报告与当前代码存在漂移——report 写于 2026-09-19，explore 代理 2026-09-20 核实发现：record_observation 已不接受 concept_unlocked（改由提交评测确定性写入）；microtask_skipped / closing_check / stage_synthesis_check 无生产写入。教学时应以代码为准，并把漂移本身作为素材。
- 用户偏好（全局 AGENTS.md）：简洁、改动可溯源、任务以 git 提交收尾。
