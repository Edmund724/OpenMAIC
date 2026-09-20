# R3 调研产出：在线学习平台学生行为采集实践（事实清单）

关联票据：`.scratch/ai-classroom-profiling/issues/03-video-behavior-collection-research.md`
日期：2026-09-20。仅列事实与学界/业界共识，不做产品决策（决策在 T1）。

## 1. 视频行为事件的标准定义

### 1.1 xAPI Video Profile（ADL，社区规范，IEEE 9274.1.1-2023 为 xAPI 基础标准）

- 七个核心动词：`initialized`（会话首条、每条会话仅一次）、`played`、`paused`（停止前必须先发 paused）、`seeked`（拖进度条，带 `time-from`/`time-to`）、`interacted`（mute、改分辨率、改窗口等，可选）、`completed`（所有片段至少看过一次才算完成，`result.completion=true` 且必须带 `duration`）、`terminated`。
- 关键结果扩展：`time`（当前播放位置，played/paused/terminated/interacted/completed 必带，精度毫秒）、`time-from`/`time-to`（仅 seeked 必带）、`progress`（0–1 累计消费比例，paused/terminated/completed 必带）、`played-segments`（按时间序记录本次 registration 看过的所有区间，如 `0.000[.]12.000[,]14.000[.]21.000`，paused/terminated/completed 必带，可直接生成观看热区图并用于计算 progress/completion）。
- 关键上下文扩展：`speed`（倍速，负值表示倒带）、`session-id`（应为 initialized 语句的 UUID，串起一次会话）、`length`、`completion-threshold`（缺省视为 1）、字幕开关/语言、音量、全屏、user-agent 等。
- progress、played-segments、completion 都以同一 `registration` 下的多次尝试聚合——即规范层面区分"会话"与"跨会话累计"。
- 来源：[ADL xAPI Video Profile 语句数据模型](https://github.com/adlnet/xapi-authored-profiles/blob/master/video/v1.0.3/statement_data_model.md)（[镜像阅读版](https://liveaspankaj.gitbooks.io/xapi-video-profile/content/statement_data_model.html)）、[IEEE 9274.1.1-2023](https://standards.ieee.org/ieee/9274.1.1/7321/)、[Fora Soft 对七动词与扩展的实践解读](https://www.forasoft.com/learn/elearning-video/articles-elearning/tracking-video-with-xapi-video-profile)。

### 1.2 IMS Caliper Analytics（1.1/1.2）

- Media Profile 定义 `MediaEvent`（actor 对 MediaObject 操作、target 为 `MediaLocation` 记录播放位置），支持 21 个 action：`Started, Ended, Paused, Resumed, Restarted, ForwardedTo, JumpedTo, ChangedResolution, ChangedSize, ChangedSpeed, ChangedVolume, EnabledClosedCaptioning, DisabledClosedCaptioning, EnteredFullScreen, ExitedFullScreen, Muted, Unmuted, OpenedPopout, ClosedPopout`（`Rewound` 已被废弃，由 `JumpedTo`/`Restarted` 承担）。
- `MediaLocation` 实体定义为"音视频中的当前播放位置"——seek 事件带目标位置是规范内做法。
- 课件翻页/浏览侧：`NavigationEvent` 仅支持 `NavigatedTo`；`ViewEvent` 表示"观察/研读"而非单纯取资源；ReadingEvent 在 1.1 已标记 DEPRECATED（文本阅读行为并入 Navigation/View 事件）。
- 来源：[IMS Caliper v1.2 规范（Media Profile）](https://www.imsglobal.org/spec/caliper/v1p2)、[IMS Caliper v1.1 规范（MediaEvent/NavigationEvent/ViewEvent 附录原文）](https://www.imsglobal.org/sites/default/files/caliper/v1p1/caliper-spec-v1p1/caliper-spec-v1p1.html)。

### 1.3 平台工程实践（Open edX）

- Open edX 的 Caliper 集成提案（OEP-0026）确认采用 Caliper 信息模型（Actor/Action/Object/Context），把 edX 既有 tracking log 事件映射为 Caliper 事件发送给分析端；MediaEvent 承载 Started/Ended/Paused/Resumed/Restarted/ForwardedTo 等，Object 为 `VideoObject` 并带 duration；同时保留 Open edX 原生 tracking log 事件体系（导航、视频、forum、作业各事件类型）。
- 来源：[Open edX OEP-0026 Caliper Real-time Events](https://open-edx-proposals.readthedocs.io/en/latest/architectural-decisions/oep-0026/caliper-realtime-events.html)。

## 2. 视频行为与学习成效的已知关联

- Kim, Guo, Seaton, Mitros, Gajos, Miller（L@S 2014，edX 4 门课 862 个视频、秒级播放/暂停/重播/退出日志）：
  - 平均 55.2% 的观看会话中途退出（其中 36.6% 的退出发生在视频前 3% 时长内——开头流失大量是"自动播放/误点"，不一定是真实弃看）；视频越长退出率越高（对数时长回归 adj-R²=0.55；5 分钟视频预测退出率 53%，20 分钟 71%）。
  - 重看（re-watching）会话的退出率（78.6%）显著高于首看（48.6%）——重看者是有明确目的的选择性观看，不能按首看的标准解释"弃看"。
  - 交互峰值（大量学生同时播放/重播某秒）平均每视频 3.7 个；重看会话峰值更高更尖（高度效应量 r=0.45）；61% 的峰值伴随画面切换（换页/换场景）。对 80 个视频人工标注出 5 类峰值成因：新材料开始（25%）、回看刚消失的内容（23%，作者解读为节奏跟不上）、跟做教程步骤、重播短片段、重复非视觉讲解。
  - 结论性质：峰值可标出"兴趣点/困惑点"，但对个体学生而言回看同时混杂"困惑"与"主动深入学习"两种语义，单看回看行为不能定性强弱。
  - 来源：[Kim et al. 2014, L@S（PDF）](https://www.eecs.harvard.edu/~kgajos/papers/2014/kim14video.pdf)。
- Guo, Kim, Rubin（L@S 2014，edX）：视频制作方式影响参与度——短视频显著更吸引人，平均参与度（观看时长/视频时长）在 6 分钟后急剧下降；含教师出镜+PPT 的画中画形式参与度最高。来源：[Guo et al. 2014, L@S（DOI 10.1145/2556325.2566239）](https://dl.acm.org/doi/10.1145/2556325.2566239)（6 分钟结论亦引述于 [Kim et al. 2014](https://www.eecs.harvard.edu/~kgajos/papers/2014/kim14video.pdf) 相关工作）。
- 倍速：Murphy, Hoover, Agadzhanyan, Kuehn, Castel（Applied Cognitive Psychology 2021）：1.5x、2x 速度观看讲座视频对理解测验成绩无显著损害，学生对倍速材料的学习信心反而被高估（metacognitive monitoring 偏差）——倍速信号不能简单解读为"没学好"。Chen et al.（Educational Psychology Review 2024）：既有研究总体支持 ≤2x 不显著损害表现；调查样本中 83% 本科生报告常用 >1x 播放。来源：[Murphy et al. 2021（UCLA PDF）](https://castel.psych.ucla.edu/wp-content/uploads/sites/111/2021/11/ACP-Lecture-Speed-Murphy-2021-in-press.pdf)、[Chen et al. 2024（Springer）](https://link.springer.com/article/10.1007/s10648-024-09917-7)。
- 弃看（dropout）作为信号：在预测建模语境里"是否退出"本身即是被预测变量和强特征（见第 5 节）；但如前所述，开头瞬时退出有很高的自动播放噪声（Kim et al. 前 3% 流失占 36.6% 的退出），做个体画像时需过滤。

## 3. 停留时长与翻页行为的有效性与噪声

- 细粒度 vs 粗粒度 time-on-task：LAK 2022 编程课研究比较提交级（粗）与击键级（细）两种时长度量：细粒度时长与周练习分相关 r≈0.35（弱但显著），粗粒度无显著相关；作者建议"能用多细的数据就用多细的"。来源：[Leinonen et al., LAK 2022（ACM）](https://dl.acm.org/doi/10.1145/3478431.3499359)。
- 时长估计方法本身改变研究结论：Kovanović et al.（JLA 2015）在全在线与混合式两个数据集上系统比较多种 time-on-task 估算法（会话切分阈值、离群点剔除方式不同会导致回归结果的方向/显著性变化），结论是时长估计必须透明、需做会话切分与离群处理，直接把"原始停留时长"当特征不可靠。来源：[Kovanović et al. 2015, JLA 2(3):81–116](https://learninganalytics.upenn.edu/ryanbaker/JLA-Vita.pdf)（JLA 论文，DOI: 10.18608/jla.2015.23.7）。
- 噪声来源的共识：页面挂着不操作、切浏览器标签、离开设备都会抬高页面级停留时长；因此业界通用做法是配合可见性（tab focus/visibility）过滤或心跳机制，xAPI/Caliper 规范层面的 `session-id`、registration 聚合也服务于同一目的。规范来源同 1.1/1.2；方法学来源同 Kovanović。
- 翻页/画面切换：Kim et al. 2014 的 61% 峰值伴随视觉切换（幻灯片切换是典型的切换点），说明"翻页"在视频/PPT 语境下是天然的交互热点锚点——但也正因如此，翻页频次同时受内容结构（一页多久）影响，作为个体投入度信号需对内容结构做归一。来源同 2。

## 4. 测验作答过程数据

- 答案修改（answer changing）量化基线（Bauer, Kopp, Fischer，BMC Medical Education 2007，慕尼黑大学 79 名医学生 78 题 MCQ 实测）：
  - 修改率约 5.2%（2%–9% 区间的既有研究共识）；
  - 首次修改方向：错→对 48.2%、对→错 21.6%、错→错 30.2%；平均净提分 +1.4 分（约 +2.5%）；
  - 第二次及以后的修改 77.9% 是错→错、基本不再提分（+0.11 分）——即只有首次修改是有效的元认知信号，反复修改接近随机猜测噪声；
  - 2005 年高风险医学考试数据：错→对 55%、对→错 25%、错→错 20%（净 +1.1%）——"首直觉谬误"被反复证伪。
  - 来源：[Bauer et al. 2007（PMC）](https://pmc.ncbi.nlm.nih.gov/articles/PMC2020461/)；"首直觉谬误"经典综述见 [Kruger, Wirtz & Miller 2005 引述版](https://people.wku.edu/steven.wininger/Kruger%20First%20Instinct%20Myth.pdf)。
- CFA（Correct on First Attempt）是 MOOC 学习分析里的标准作答过程指标：Fei & Yeung（IEEE TLT 2015）与 Brinton & Chiang 用按资源（视频/题目）聚合的行为序列（点击数、停留时长、暂停数等）+ CFA 标签做成绩演化预测。来源：[Brinton & Chiang, MOOC Performance Prediction via Clickstream Data and Social Learning Networks（PDF）](https://cbrinton.net/MOOC_perfPred.pdf)。
- 结论性质：逐题用时与修改痕迹是低成本可采的过程信号，但"修改次数"必须与"修改方向/次序"一起存（首次 vs 反复语义不同），且修改行为在低利害练习中的基线率需产品内自标定。

## 5. MOOC clickstream 公认强信号（预测/画像常用特征族）

- 极简单特征即可早预测流失：Alamri et al.（ITS 2019）用第一周仅 2 个易得特征在 FutureLearn 数据上达 82%–94% 准确率预测结课流失，超过当时的多特征 SOTA——共识是"第一周活动量"是最强单族特征。来源：[Alamri et al. 2019（arXiv）](https://arxiv.org/abs/2008.05849)（[Springer DOI](https://dl.acm.org/doi/10.1007/978-3-030-22244-4_20)）。
- 文献反复使用的特征族（成绩/结业预测）：
  1. 活跃广度与规律：每周活跃天数、会话数/间隔（burstiness）、登录频次；
  2. 视频消费：观看视频数、视频完成率/观看比例（progress）、重看行为；
  3. 作业/测验：尝试次数、CFA、提交时间相对截止时间的提前量（earliness）、得分；
  4. 论坛：发帖/回帖量（Crossley et al. 用 clickstream+论坛特征以约 70% 准确率预测结业）。
  - 来源：[Crossley et al., LAK 2016（ACM PDF）](https://dl.acm.org/doi/pdf/10.1145/2883851.2883931)、[Dalipi et al. 2018 综述（EDUCON）](https://ntnuopen.ntnu.no/ntnu-xmlui/bitstream/handle/11250/2598840/Post-print_EDUCON-2018.pdf?sequence=4)、[Gardner et al. 2018, MORF 大规模复现研究（PDF）](https://learninganalytics.upenn.edu/ryanbaker/MORF_Xing.pdf)。
- 方法学警告（Gardner & Brooks 2018，96 个模型比较）：MOOC 预测文献普遍存在模型评估方法不当的问题，特征族"谁更强"的结论对评估方法敏感；复制性研究显示简单特征+简单模型常已接近复杂方案的 AUC。来源：[Gardner & Brooks 2018（arXiv）](https://arxiv.org/abs/1801.08494)。
- 提交及时性：作业提交时间早晚与成绩的关系有专门研究（Leinonen et al., ITiCSE 2021, "Does the Early Bird Catch the Worm?"），该问题在预测建模中常被作为独立特征族使用。来源：[LAK 2022 论文参考文献 22](https://dl.acm.org/doi/10.1145/3478431.3499359)。

## 6. 综述性判断：学界/业界的"最小有用采集集"共识

（仅列共识项，非产品决策。）

1. 视频侧：play/pause/seek（带 from/to 位置）/completed + 播放位置时间戳 + 倍速 + 会话边界（session-id）——xAPI Video Profile 的 7 动词 + 4 结果扩展即是事实标准；played-segments/progress 支持热区图与完成率计算（来源：1.1）。
2. 课件浏览侧：资源导航事件（NavigatedTo/Viewed）+ 页/位置粒度 + 会话内停留——Caliper Navigation/View 事件是事实标准；停留时长必须配合可见性过滤与会话切分才有意义（来源：1.2、3）。
3. 测验侧：attempt 开始/提交/得分 + 逐题用时 + 答案修改轨迹（含修改前后选项与次序）（来源：4）。
4. 聚合侧共识特征：每周活跃天数、视频完成率、作业提交及时性、CFA——这四族是 MOOC 预测文献中复现性最好的行为特征（来源：5）。
5. 横切要求（规范与文献共同强调）：每条事件带 actor/session/timestamp/资源标识；区分会话与跨会话累计（registration）；原始日志之外保留可重放的事件流（edX 同时保留原生 tracking log 与 Caliper 映射的做法即为例证）（来源：1.1、1.3）。

## 未覆盖/局限

- PDF/PPT 阅读器内更细行为（高亮、缩放、文本选择）缺少统一标准事件，Caliper ReadingEvent 已废弃、尚无替代规范——调研中未找到学界共识清单。
- 回看/倍速与"个体掌握度"的因果性证据总体较弱（多为相关性或 aggregated 分析），第 2 节的结论均按相关/信号语义引用。
- Brooks & Thompson 关于"通用特征 vs 内容相关特征"的具体对比数据未找到可访问一手 PDF，第 5 节以 Gardner & Brooks 2018 的可访问版本替代引用。
