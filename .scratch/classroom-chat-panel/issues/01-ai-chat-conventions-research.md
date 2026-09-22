# R1：主流 AI 对话产品的会话管理惯例调研

Type: research
Status: resolved
Blocked by: —

## Question

学生的原话是"现在对于历史对话和新对话的管理，不符合大部分 AI 网页端对话的习惯"。要把"习惯"变成可执行的设计约束，先得有一份**事实清单**，覆盖三层：

1. **桌面 AI 对话产品**（ChatGPT、Claude、Gemini、Copilot、Kimi、豆包）的会话管理惯例：历史列表放哪、"新对话"按钮怎么做、列表条目显示什么字段、标题怎么生成（首句截断 / 模型总结）、时间怎么表达（相对时间 / 分组）、重命名与删除的交互位置、空态放什么。
2. **窄容器下的两屏模式**（手机端聊天应用与响应式 AI 产品的通行做法）：列表屏 ↔ 对话屏的切换入口放哪、切过去的动效与时机、返回时的状态保持。
3. **背景推送**：当引擎/服务端在后台推进了一段对话（新消息到达、会话被自动结束），主流产品在列表上怎么提示（未读点、排序上浮、角标），有没有"正在进行的对话被自动切换前台"的先例。

产出 `.scratch/classroom-chat-panel/research/01-ai-chat-conventions.md`，每条惯例附来源（产品名 + 版本或观察时间 + 文档/截图链接）。**只报事实，不做设计建议，不评判哪个更好。** 不要改动任何票或 map 文件；完成后把要点摘要返回给主会话。

## Answer

全部细节与逐条出处见 [research/01-ai-chat-conventions.md](../research/01-ai-chat-conventions.md)（含可信度分级、横向对照表、未能核实清单）。逐层要点：

**一层：桌面产品的会话管理惯例**
- **六家一致**：历史列表在左侧边栏；"新对话"在侧边栏顶部；列表条目只显示**标题**（无预览、无逐条时间戳）；标题**自动生成**（Claude 是"首轮对话后"生成，Copilot 官方原文"开始新 chat 时自动生成"，Kimi Code Web 版"首轮后生成"，豆包按首次提问）；用户可重命名覆盖。
- **时间表达三种做法并存，不统一**：Copilot 官方按 **Yesterday / Previous 7 days / Previous 30 days / 当前年 / 上一年** 分组，且**明确移除了逐条时间戳**（MC1020215，2025-03）；ChatGPT 历史上按 Today / Yesterday / Previous 7/30 Days 分组，但 2025 年后多次改版（当前形态未能核实）；Claude 与 Gemini 是**无分组的倒序平铺**（Gemini 侧边栏无原生文件夹/分组）。
- **重命名与删除位置两种范式**：**条目上**（ChatGPT ••• → Rename/Archive/Delete，其中归档无需确认、删除需二次确认；Copilot 标题旁 ••• → Rename / Move to notebook / Delete；Gemini kebab → Pin/Rename/Delete；豆包 `...` → 重命名/置顶/批量删除）vs **对话页顶部**（Claude 官方：点屏幕顶部对话名称 → 删除或重命名；豆包官方隐私政策也只写"点击对话框 → 单个对话 → 删除"）。Copilot 与 Claude 都有批量删除。
- **排序副作用（有据）**：ChatGPT 重命名会让条目跳到列表顶部；Copilot 按每个 session 的最近交互时间组织列表，**空分组不显示**。
- **空态：六个产品全部未能核实**（Claude 的 "How can I help you today?" 只有二手来源）。

**二层：窄容器两屏模式**
- 平台规范层面 **list-detail 是正式命名的规范布局**（Android/Material 3），文档**明确点名消息类应用**，并明确规定：expanded 双栏同显；medium/compact 只显一栏；只显列表时选一项就地替换为详情，只显详情时**返回键回到列表**；尺寸变化时**保留应用状态**（变窄→详情保持、列表隐藏；变宽→列表与详情同显且标出选中项）；状态需 hoist，窄屏加 BackHandler。Apple `NavigationSplitView` 同构：窄 size class 折叠成单栈、列表行画 disclosure chevron、`preferredCompactColumn` 决定栈顶、返回键把值从 `.detail` 变回 `.sidebar`。
- 实际移动端入口：ChatGPT 用**右滑手势**打开侧边栏（有官方社区帖抱怨灵敏度过高误触）；Gemini 2025-06 加入导航抽屉（New chat / Gems / Recent history）；Copilot 2025-08 移除底部 tab、聊天历史默认展开。
- **返回时的状态保持**：平台文档只承诺"app state"，不细化到滚动位置/草稿；六个产品的官方文档均未描述 → **未能核实**。反向证据是多个产品（Cursor、OpenCode 等）的 bug 报告都指向"切换后滚动位置重置"。

**三层：背景推送**
- **未读点有先例**：ChatGPT 侧边栏对话上出现**蓝点**表示"你离开页面后生成了回复"（用户抱怨无法清除）；Telegram 用 Chat Folders 的 "Unread" 类型 + 未读计数徽标 + 图标角标；移动 OS 通用做法是会话列表蓝点 + 图标数字角标、打开即清。
- **排序上浮有先例**：Copilot 官方按"每个 session 的最近一次交互"重排并重新归组（MC1020215）；IM 类会话列表普遍按最新消息置顶。
- **"正在进行的对话被自动切换前台"：在六个主流 AI 对话产品里未能核实存在先例**（检索范围内既未找到官方文档，也未找到可靠观察）。相邻领域有明确先例但**不是 AI 对话产品**：站内实时客服组件 Intercom、tawk.to 会在新消息到达时自动弹出（Intercom 那条还指出自动弹出会把未读数清零）。反向先例：面向长时 agent 的 Pizza Bot 采用 email-style inbox，而不是把完成的会话弹到前台。

**调研限制（重要）**：本机无法访问 `*.google.com`，Google/Gemini 全部条目只能到"厂商域名页面的搜索摘要"级别，已逐条标注；文中另汇总了 8 项未能核实的内容（见研究文档第四节）。全文只报事实，未给出任何设计建议或优劣判断。
