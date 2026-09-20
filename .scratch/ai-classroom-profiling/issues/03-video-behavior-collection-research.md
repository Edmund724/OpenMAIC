# R3：视频与在线学习行为采集实践调研

Type: research
Status: resolved
Blocked by: —

## Question

调研在线学习平台（MOOC、视频课）的学生行为采集实践，回答"课件侧应该埋哪些点、哪些信号对判断掌握/投入有效"：

- 视频行为事件的标准做法（play/pause/seek/rate/complete；xAPI、Caliper Analytics 等标准），回看/倍速/弃看与学习成效的已知关联。
- 页面/课件停留时长、翻页行为的有效性与噪声。
- 测验作答过程数据（逐题用时、修改答案痕迹）的采集与分析实践。
- MOOC clickstream 研究中公认的强信号（成绩/结业预测常用的行为特征族）。
- 轻量落地判断：对一个左课件右助教的单课程产品，最小有用的行为采集集大致是什么。

输出事实清单 + 来源，不做产品决策（决策在 T1）。

产出写入 `.scratch/ai-classroom-profiling/research/03-video-behavior-collection.md`。不要改动任何票或 map 文件；完成后把要点摘要返回给主会话。

## Answer

已由 research 子代理完成（2026-09-20）。产出：`.scratch/ai-classroom-profiling/research/03-video-behavior-collection.md`（事实清单，每条附来源 URL）。

要点：xAPI Video Profile（7 动词 + progress/played-segments/speed 扩展）与 Caliper MediaEvent 是视频埋点事实标准。首看/重看必须分开解释（Kim 2014：55% 会话中途退出，重看峰值多伴随画面切换）；倍速 ≤2x 不显著损害理解；停留时长必须细粒度+可见性过滤（粗粒度无效）；改答案首次净收益为正（错→对约 48–55%），二次以上为噪声；MOOC 预测共识特征族=每周活跃天数、视频完成率、提交及时性、CFA（首周 2 特征即达 82–94% 流失预测）。文末附"最小有用采集集"共识清单；PDF 细粒度阅读行为无标准，需自行定义。
