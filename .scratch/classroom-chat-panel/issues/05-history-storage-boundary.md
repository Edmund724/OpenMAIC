# G2：隐藏列表与"当前对话"的存放边界

Type: grilling
Status: resolved
Blocked by: 04

## Question

1. **隐藏列表存哪**——学生的"隐藏这段对话"记在哪个存储里（stage 存储的 KV？设置存储？会话自身的一个标记字段？）。跨刷新要保住吗？换设备丢掉可接受吗？
2. **"当前对话"选择要不要持久化**——现在 `activeSessionId` 只是 React state（`use-chat-sessions.ts:564`），刷新即丢、回到"没有选中"。学生刷新后应该回到上次那段对话，还是回到最新的一段？
3. **隐藏的语义边界**——允许隐藏一段**正在进行**的对话吗？隐藏之后引擎还能往里写消息吗（比如讨论还在继续）？隐藏是不是"删除"的心理等价物，"已隐藏"要不要给个入口捞回来？
4. **T1 的结论怎么落**——若双实例竞争属实，把会话状态下沉到 zustand 是本次就做，还是留给后续（结合本次目标权衡代价）。

会话开场调 Skill: grilling + domain-modeling。

## Answer

**一句话：这张票最后只剩一条决定——"当前显示的对话"持久化到 device KV；隐藏功能被砍掉（2026-09-22 用户决定），本票关于隐藏的四个问题随之作废。**

### 1. 不做隐藏、也不做删除

- 今天代码里本来就没有任何"隐藏 / 删除单条会话"的能力：对话 tab 就是 `useStageStore.chats` 里非 lecture 的会话全部渲染（`chat-area.tsx:160` + `session-list.tsx:58`），没有过滤标记；存储层也没有按单条会话删除的路径（只在删整个 stage 时全量清，`lib/utils/stage-storage.ts:631-645`）。
- 原决定"删除做成**本地隐藏**"（P1 拍的形状）据此推翻：条目菜单只留"改名"。理由：隐藏要额外引一个 device KV 键、一个"已隐藏（N）"入口与三条边界（未读 / 复活 / 进行中），换来的只是"本地视觉整理"——不释放存储、不减少数据、跨设备还失效；而课堂里列表只增不减本身说得通（提问记录是学习轨迹）。将来真要补，加一个键 + 一个入口即可，不影响现在的结构。
- 因此原问题 1、3 与追问 Q14–Q17（隐藏存哪、隐藏与进行中会话、隐藏只过滤列表、不静音、复活时自动取消隐藏）**全部作废**。

### 2. "当前显示的对话"持久化到 device KV 单键

- 键：`display-session:${stageId}:${learnerKey}`，scope **必须显式传 `'device'`**（默认是 `'account'`，`packages/@openmaic/storage/src/kv/types.ts:58`）。
- 事实依据：会话列表按 `createdAt` 升序（`lib/utils/chat-storage.ts:999-1001`）→"最新一段"可派生；**"上次看的那段"推不出来**，只有存指针。
- 兜底：指针指向的会话不存在时，回落"最新一段"（按 `createdAt` 取末位），一段都没有则空对话屏。
- 为什么不是会话字段 / stage 存储 / 设置存储：会话字段过不了持久化往返（`lib/utils/chat-storage-core.ts` 的 `statePayload:316-336`／`isStatePayload:353-379`／`foldRecords:414-431` 都是显式字段重建）；stage 存储加一个 kind 要动 7 处，且走文档本体就变成同一 course 所有学习者共用一份；设置存储是 `account` scope，会跟账号跨设备同步。
- 形状照抄 `lib/document-store/current-scene.ts:13-75`；stage 删除时的清理钩子在 `lib/utils/stage-storage.ts:631-645` 之后补一行（前缀批量清的先例 `lib/pbl/v2/runtime/drain.ts:234-240`，守卫测试 `tests/runtime/stage-delete-wiring.test.ts:97-104`）。
- 实现注意：`normalizeStoredSessionsForRestore`（`use-chat-sessions.ts:289-305`）会把 active→interrupted、soft-closing→completed，读回的指针要在这条路径之后校验，否则可能指向一个状态已变的会话。

### 3. T1 的结论怎么落

- 不必把会话状态下沉到 zustand（T1 已证伪触发前提，守卫在 `tests/chat/chat-session-mount-graph.test.ts`）。`displaySessionId` 仍由 hook 持有（React state），只**写穿**到上面那个 device KV 键。

### 对 S1 的交待

- 新增一个"按 stage 的 device KV 小工具"（或照 `current-scene.ts` 各写一处），规定 key 命名与 stage 删除时的清理。
- `displaySessionId` 与 `activeSessionId` 的关系、未读的判定与清零位置，写进结构与 props 层。
- 砍掉隐藏省下的活：不需要隐藏列表的存储、不需要"已隐藏（N）"入口、不需要隐藏相关的 i18n 键与测试。
