# 主流 AI 对话产品的会话管理惯例：事实清单

调研日期：2026-09-22
调研方式：WebSearch + FetchURL 拉取厂商一手文档；无法直接打开页面时退回搜索引擎摘要，并在条目内标注。
本文只记录事实。凡涉及"多数产品都……""通常是……"的概括，都在正文给出逐产品出处；未找到出处的一律写"未能核实"。

## 0. 可信度分级

| 标记 | 含义 |
|---|---|
| 【一手】 | 厂商官方文档 / 官方帮助中心 / 官方更新日志 / 官方 roadmap 消息，页面已直接打开并读取全文 |
| 【一手·摘要】 | 出处是厂商域名下的页面（如 `support.google.com`、`gemini.google.com`），但当前网络环境无法打开，只能读到搜索引擎返回的摘要原文 |
| 【二手】 | 媒体报道、教程站、社区帖。同一事实需要 ≥2 个独立来源才写入 |

无标记的补充说明为调研方法备注。

**网络限制说明**：本机无法访问 `*.google.com`（`curl` 对 `support.google.com` / `gemini.google.com` / `www.google.com` 均返回 `000`，连接失败）。因此所有 Google/Gemini 相关条目只能到【一手·摘要】级别。文中已逐条标注。

---

## 一、桌面 AI 对话产品的会话管理惯例

### 1.1 横向对照表

| 维度 | ChatGPT | Claude | Gemini | Microsoft 365 Copilot | Kimi | 豆包 |
|---|---|---|---|---|---|---|
| 历史列表位置 | 左侧边栏 | 左侧边栏（Starred / Recents 两组） | 左侧边栏 Recents | 左侧导航 Chats 列表 | 左侧边栏历史会话列表（项目栏目在其上方） | 左侧历史对话列表 |
| 新对话入口 | 侧边栏顶部 New chat | 侧边栏 New chat | 侧边栏顶部新建（铅笔纸张图标） | 新建 chat | 「新建会话」 | 「新对话」 |
| 列表条目字段 | 标题 | 标题 | 标题 | 标题 | 标题（主站字段未能核实） | 标题 |
| 标题生成 | 自动生成，可重命名 | 首轮对话后自动生成，可重命名 | 自动生成，可重命名 | 【一手】自动生成，可替换 | 【一手，Kimi Code Web】首轮后自动生成 | 按首次提问自动生成 |
| 时间表达 | 按 Today / Yesterday / Previous 7 Days / … 分组（当前形态有争议） | 无日期分组，按时间倒序平铺 | 时间倒序平铺，无分组 | 【一手】按最近交互时间分组，无逐条时间戳 | 主站未能核实 | 未能核实 |
| 重命名 / 删除位置 | 条目 ••• 菜单 | 【一手】对话页顶部标题 或 侧边栏条目 | 条目 kebab 菜单 | 【一手】条目标题旁 ••• 菜单 | 【一手】"找到对应会话，点击删除" | 条目 ••• 菜单（官方隐私政策确认删除入口在对话内） |
| 空态 | 未能核实 | 未能核实 | 未能核实 | 未能核实 | 未能核实 | 未能核实 |

### 1.2 ChatGPT（OpenAI）

- **历史列表位置**：左侧边栏。删除/归档操作说明以"Open your ChatGPT chat history"为第一步，操作对象是列表条目上的 ••• 菜单【一手】[Deleting and archiving chats in ChatGPT](https://help.openai.com/en/articles/8809935-deleting-and-archiving-chats-in-chatgpt)（页面标注 2026-09-22）。
- **新对话**：侧边栏顶部的 New chat 按钮；2026-07 的一次改版中另出现 "Quick chat" 按钮，位于左侧【二手】[Where did my ChatGPT projects go?](https://community.openai.com/t/where-did-my-chatgpt-projects-go/1386177)（2026-07-09）。
- **重命名 / 删除**：
  - 删除：列表条目 ••• → Delete → 二次确认；删除立即从账号视图消失，30 天内从系统永久删除，不可恢复【一手】（同 OpenAI 帮助页）。
  - 归档：列表条目 ••• → Archive，**无需确认**；归档后从常规侧边栏移除，但仍可搜索，在 Settings → Data controls → Archived chats 里可 Unarchive 或 Delete【一手】（同页）。
  - 重命名：条目 ••• → Rename【二手】[Renaming a ChatGPT session label pops it to the top](https://community.openai.com/t/did-you-know-renaming-a-chatgpt-session-label-in-your-history-pops-it-to-the-top/716511)（2024-04-13）。该帖同时报告：**重命名会让条目跳到列表顶部**。
- **时间表达**：多个二手来源一致描述为按 Today / Yesterday / Previous 7 Days / Previous 30 Days / 月 分组，条目上不显示逐条时间戳【二手】[NorthLab Apps: How to See the Date of a ChatGPT Conversation](https://northlabapps.com/blog/chatgpt-conversation-dates/)（2026-07-16）、[GPT Master](https://gptmaster.app/resources/chatgpt-organization/)（2026-03-19）。
  - **但该形态存在版本争议**：2025-06 有用户公开信称分组被移除【二手】[Sidebar Date Grouping — Why Remove a Useful Feature?](https://www.linkedin.com/pulse/sidebar-date-grouping-why-remove-useful-feature-open-connors-ph-d--lucle)（2025-06-12）；2026-09 仍有用户请求"把 Activity 视图重新按 Today / Yesterday / Previous 7 days / Older 分组"【二手】[Collapse Activity view by date in ChatGPT Desktop sidebar](https://community.openai.com/t/feature-request-collapse-activity-view-by-date-in-chatgpt-desktop-sidebar/1398807)（2026-09-18）。
  - 结论：**"存在时间分组"这件事有据；"当前桌面版具体呈现哪种形态"未能核实**，不同版本与不同视图（Chats / Activity）表现不一致。
- **空态**：官方文档与可靠来源均未描述侧边栏空态或新对话空态的内容。**未能核实**。

### 1.3 Claude（Anthropic）

- **历史列表位置**：左侧边栏，分为 **Starred**（收藏）与 **Recents**（最近）两组【二手】多来源一致，例如 [The Claude Sidebar System Pros Use](https://claudeunleashed.substack.com/p/the-claude-sidebar-system-pros-use)、[How to Use Claude AI Full Guide](https://www.meetjamie.ai/blog/how-to-use-claude)（2025-12-13，其描述为 "Sidebar: Start new chats, access Projects, view Starred conversations, and browse your Recents"）。
- **新对话**：侧边栏 New chat 按钮；快捷键 Ctrl/Cmd + Shift + O【二手】[How to Use Claude AI (2026)](https://www.fahimai.com/de/how-to-use-claude-ai)（2026-03-04）。
- **重命名 / 删除**（官方帮助中心，2026-03-05 更新）【一手】[我如何删除或重命名对话？](https://support.anthropic.com/zh-CN/articles/8230524-%E5%A6%82%E4%BD%95%E5%88%A0%E9%99%A4%E6%88%96%E9%87%8D%E5%91%BD%E5%90%8D%E5%AF%B9%E8%AF%9D)：
  - 单个对话：① 导航到该对话 → ② **点击屏幕顶部的对话名称** → ③ 在弹出选项里选"删除"或"重命名"。注意：入口在**对话页顶部**，不在列表条目上。
  - 批量删除：① 点击左侧边栏的 "Chats" 进入聊天历史记录 → ② 悬停到要删的对话上，勾选出现的复选框 → ③ 点击"删除所选项"。
- **标题生成**：首轮对话后自动生成分类式标题，用户可重命名覆盖；侧边栏搜索只搜标题不搜正文【二手】[The Claude Sidebar System Pros Use](https://claudeunleashed.substack.com/p/the-claude-sidebar-system-pros-use)、[How to Add Folders to Claude](https://northlabapps.com/blog/claude-folders/)（2026-06-13）。重命名入口为条目悬停出现的三点菜单【二手】[How to rename a chat from the sidebar in Claude.ai](https://www.guideflow.com/tutorial/how-to-rename-a-chat-from-the-sidebar-in-claudeai)（2026-03-04）。
- **时间表达**：百科式与教程类来源一致描述 Recents 为**平铺的时间倒序列表，无日期分组**；"sidebar 不 scale，没有文件夹、标签，一切都待在扁平的时间顺序列表里"【二手】[How to Organise Your Claude AI Conversations](https://ai-chat-importer.com/blog/how-to-organise-your-claude-ai-conversations)（2026-04-07）。官方文档未描述时间表达。
- **空态**：新对话页文案为 "How can I help you today?"，多个来源引用该文案（含公开的 system prompt 集合与教程站）【二手】，但**未在 Anthropic 官方文档中直接核实**，标为未能核实。

### 1.4 Gemini（Google）

> 本小节全部条目只能到【一手·摘要】或【二手】级别，因为 `*.google.com` 在当前网络不可达。

- **历史列表位置**：左侧边栏 "Recents"；可在侧边栏顶部展开/收起（"点击侧边栏顶部的三横线图标展开，再点一次收起"）【二手】[How to create documents with Gemini Canvas](https://www.computerworld.com/article/4082627/how-to-create-documents-and-more-with-gemini-canvas.html)（2025-10-31）。
- **新对话**：侧边栏顶部的"新对话"（铅笔+纸张图标）【二手】（同上，Computerworld 2025-10-31）。
- **条目操作**：官方支持页明确"可以置顶（pin）、重命名（rename）和删除对话"；重命名路径为"在侧边栏悬停到目标对话 → 点击 More → 点击 Rename"【一手·摘要】[Find & manage your recent chats in Gemini Apps - Computer](https://support.google.com/gemini/answer/13666746?hl=en)。条目上的三竖点（kebab）菜单提供 Pin / Rename / Delete【二手】[PCMag: How to Use Google Gemini AI: 14 Ways](https://uk.pcmag.com/ai/151489/how-to-use-google-gemini-ai-14-ways-it-can-make-your-life-easier)（2024-08-09）。
- **时间表达**：Google 支持社区答复（2026-02-01）称"侧边栏仍是一个按时间顺序排列的近期对话列表"，无原生分组/文件夹【一手·摘要】[Grouping of Chats in Gemini](https://support.google.com/gemini/thread/406520194/grouping-of-chats-in-gemini?hl=en)。2026-04 有报道称 Google 正在小范围测试 "Projects" 文件夹功能【二手】[Gemini is getting a Projects feature](https://tech.yahoo.com/ai/gemini/articles/gemini-getting-projects-feature-help-165125733.html)（2026-04-10）。
- **搜索**：2025-08-21 起支持搜索聊天历史，网页与移动端全量上线；入口是展开导航菜单后点放大镜或 "Search for chats" 条【一手·摘要】[Gemini Apps' release updates and improvements](https://gemini.google.com/updates?hl=en-CA)（2025-10-07 页面，条目日期 2025-08-21）。
- **空态**：未能核实。
- **重命名后再置顶的排序影响**：未能核实。

### 1.5 Microsoft 365 Copilot

- **历史列表位置**（官方帮助页，2026-07-15）【一手】[How Microsoft Copilot Chat history works](https://support.microsoft.com/en-us/microsoft-365-copilot/how-microsoft-365-copilot-chat-history-works)：在 Microsoft 365 Copilot 应用里，Copilot Chat 的**左侧导航**有 **Chats** 列表，选一条即可回看或继续。
- **条目菜单**（同页）【一手】：标题旁 **... More** 提供三项 —— Rename、Move to notebook、Delete。
- **标题生成**（官方 FAQ，2026-07-15）【一手】[Frequently asked questions about Microsoft 365 Copilot Chat](https://support.microsoft.com/en-us/microsoft-365-copilot/frequently-asked-questions-about-microsoft-365-copilot-chat)：原文 —— "When you start a new Copilot chat, Copilot automatically generates a chat title to display in your chat history list. This is to make it easier to find chats you've had with Copilot in the past. You can change the generated title by selecting the ... More button and replacing the generated title with one of your own."
- **时间表达与排序**（Microsoft 365 Message Center 消息 MC1020215，2025-03 GA）【一手】原文要点：
  - 新特性"按每个 session 的**最近一次交互**组织用户的 chat history"；对既有历史和新会话都生效。
  - 分组为：**Yesterday / Previous 7 days / Previous 30 days / 当前年份 / 上一年**。
  - **没有任何 session 的分组不显示**。
  - "Existing functionality such as session deletion and the ability to rename a session remain."
  - **"Timestamps will no longer display next to each item."**（逐条时间戳被移除）
  - 来源：Microsoft 365 Roadmap ID 477358，经第三方整理的 Message Center 全文 [kbworks.eu 转载](https://kbworks.eu/microsoft-roadmap-messagecenter-and-blogs-updates-from-19-03-2025/)（2025-03-19）。
- **Teams 内的 Copilot Chat 导航面板**：2025-10 从右侧移到左侧，继续承载 agents 与对话历史，并新增 **All Conversations** 页【二手】[Microsoft Copilot (Microsoft 365): Updated UI for the Copilot Chat Navigation Pane in Teams](https://app.cloudscout.one/evergreen-item/499148/)（2025-11-18）。
- **移动端**（2025-08 起）：移除底部 tab 导航，Copilot Chat 成为默认落地页；**聊天历史默认展开**；其他功能移入汉堡菜单；iOS 先、Android 后【二手】[M365 Admin: Copilot Mobile App — Bottom tabs removal and default land to Chat](https://m365admin.handsontek.net/microsoft-365-copilot-mobile-app-bottom-tabs-removal-default-land-chat/)（2025-08-05）。
- **空态**：未能核实。

### 1.6 Kimi（Moonshot AI）

- **侧边栏结构**（官方帮助中心）【一手】[Kimi 项目（Project）是什么？](https://www.kimi.com/help/features/project)（页面日期 2026-09-18）："「项目」栏目位于 Kimi Claw 入口下方、**历史会话列表上方**，按最近创建时间倒序展示你的项目；展开某个项目可看到其内部会话列表。" 项目主页面为三栏：左（标准侧边栏）、中（对话发起区 + 项目内会话列表）、右（指令 / 文件 Panel，可折叠）。
- **新建会话**（官方帮助中心）【一手】[Kimi 怎么用？模型选择与对话入门](https://www.kimi.com/help/new-user-guide/agentic-chat)（2026-09-18）："点击『新建会话』= 重新开始，历史上下文清空"；文档明确区分"会话（Session）"与"对话轮次（Turn）"两个概念。
- **删除**（官方 FAQ）【一手】[Kimi 对话常见问题与排查](https://www.kimi.com/help/others/chat-issues)（2026-09-18）："在 Kimi App 或网页版中找到对应会话，点击删除。删除后，该会话在你的设备端不再显示；相关数据会按照 Kimi 隐私政策第 5 节的规定进入处理流程。" 官方**未写明**删除入口具体在哪一层（列表条目还是对话页）。同页还有"误上传敏感信息怎么办"→"建议立即在客户端删除对应会话"。
- **标题生成**（官方变更记录，Kimi Code Web 版）【一手】[Kimi Code 变更记录](https://www.kimi.com/code/docs/kimi-code-cli/changelog)（2026-09-19）："Web 版会话的 AI 标题功能默认开启：**首轮对话后自动生成标题**，并可在重命名输入框中重新生成。" 同一变更记录还提到"侧边栏新增 Open / Done / Workspaces 标签页，会话可标记为 Done""新增会话管理页面"。
  - 注意：这是 **Kimi Code Web 版**，不等于 kimi.com 主站。主站 kimi.com 的标题机制未能核实。
- **时间表达**：Kimi Code CLI 的 `/sessions` 列表"显示每个会话的标题和**最后更新时间**"【一手】[Kimi Code CLI 会话管理与上下文](https://www.kimi.com/help/kimi-code/cli-sessions)（2026-09-18）。主站 kimi.com 的列表时间表达未能核实。
- **置顶 / 重命名**：官方帮助中心只在**项目**上写明"在侧边栏项目名上悬浮或右键，可『编辑标题』『置顶』"。**会话条目**上的置顶/重命名入口官方未写明，未能核实。
- **空态**：未能核实。

### 1.7 豆包（字节跳动）

- **历史列表位置**：左侧"历史对话"列表。官方隐私政策在"查阅、复制、更正、补充、删除你的个人信息"一节写明路径："**查阅/复制/删除历史对话：点击对话框--点击单个对话--删除**"【一手】[豆包隐私政策](https://www.doubao.com/legal/privacy)（更新日期 2026-09-10，生效 2026-09-17）。即：官方文档确认存在"历史对话"这一结构，且删除动作发生在**单个对话内**。
- **新对话**："新对话"按钮【二手】多来源一致，例如 [豆包网页版指南](https://doubao-wang.cn/)（2026-09-11，"🕐 历史对话列表 左侧边栏"）、知乎专栏《豆包网页版「0 门槛入坑」全攻略 Day2》（2025-06-25，逐条拆解左侧功能菜单，含"新建对话入口""收起侧栏"）。
- **条目字段**：标题 —— "每一个对话会话通常会有一个根据您首次提问内容自动生成的标题"【二手】[豆包是否支持自动保存对话](https://www.php.cn/faq/1397716.html)（2025-07-10）。
- **重命名 / 删除入口**："点右侧的『三个点』图标，选『批量删除对话』，然后勾选需要删的那几条"【二手】[豆包怎么删除对话记录？手机端、电脑端操作全说清楚](https://www.chooseai.net/news/5749)（2026-08-11）；另有多个独立来源描述同一形态：左下角"历史对话"→ 右侧 `...` → 批量删除对话【二手】[天极下载教程](https://mydown.yesky.com/news/303392.html)（2025-07-14）、[知乎专栏《豆包网页版批量删除历史记录》](https://zhuanlan.zhihu.com/p/1962912172574212208)（2025-10-18）。
- **置顶**：列表条目上有一个图钉按钮，用于置顶；有教师用户的课堂实录描述"像钉子一样的按钮是『置顶』，我把工作生活中的内容分门别类置顶……重命名后置顶"【二手】[中考作文课堂实录](https://sjds.net/587817.html)（2026-03-20）。
- **重命名**：条目 `...` 菜单内有"重命名"【二手】（同上，多来源一致）。
- **时间表达**：未能核实。**空态**：未能核实。**删除是否可从列表条目直接发起**：官方隐私政策只写了对话内路径；二手来源普遍描述列表条目 `...` → 批量删除，两者可能并存，标注为未完全核实。

---

## 二、窄容器下的两屏模式（列表屏 ↔ 对话屏）

### 2.1 平台方的一手规范

**Android / Material 3：list-detail 是一个正式命名的规范布局**（官方开发者文档）【一手】[Canonical layouts — large-screen-canonical-layouts](https://developer.android.google.cn/guide/topics/large-screens/large-screen-canonical-layouts?hl=en)。原文要点：

- list-detail 把窗口切成并排两栏：一栏列表、一栏详情；用户从列表选一项，详情栏显示对应内容。
- **Expanded 宽度**：列表与详情同时显示；选中列表项会更新详情栏。
- **Medium / Compact 宽度**：只显示列表或详情其中之一。**只显示列表时，选中一项会用详情就地替换列表；只显示详情时，按返回键重新显示列表。**
- 该文档**明确点名消息类应用**是典型场景，并给出配图 "Messaging app showing a list of conversations and the details of a selected conversation"。
- **尺寸变化时的状态保持**（原文 "preserving app state"）：
  - Expanded 双栏变窄到 medium/compact → **详情栏保持可见，列表栏隐藏**。
  - 窄屏只有详情时变宽到 expanded → 列表与详情同显，**且列表标出与详情对应的那一项为选中态**。
  - 窄屏只有列表时变宽到 expanded → 列表 + **占位详情栏**同显。
- 实现约定：所有状态（当前 window size class、被选中的列表项）都要 hoist 到上层，保证各 composable 都能正确渲染；窄屏只显示详情时加一个 `BackHandler`，它**不属于**应用整体导航，而是依赖 window size class 与选中态。
- 该布局由 `ListDetailPaneScaffold` 提供，文档注明它"自动处理基于 window size class 的分栏逻辑并支持栏间导航"。
- 同样的三套 canonical layout（feed / list-detail / supporting pane）在 Material 3 官方站点重复给出【一手·摘要】[Canonical layout examples](https://m3.material.io/foundations/adaptive-design/canonical-layouts)（页面正文未能抓取，仅取搜索结果摘要）。

**Apple / SwiftUI NavigationSplitView**（官方开发者文档）【一手】[NavigationSplitView](https://developer.apple.com/documentation/swiftui/navigationsplitview)：

- 窄 size class（iPhone、Apple Watch、iPad Slide Over）下，navigation split view **把各栏折叠成一个 stack**，显示"最后一栏有有用信息的那一栏"。例：三栏场景先显示部门列表，选部门后显示该部门员工，选员工后显示员工详情。
- 折叠状态下，**列表行会绘制 disclosure chevron**；同时 split view **忽略 columnVisibility 的可见性控制**。
- 可用 `preferredCompactColumn` 指定折叠时栈顶显示哪一栏；文档示例：iPhone 上先显示蓝色详情页，**用户点返回键后看到黄色列表页，`preferredCompactColumn` 的值从 `.detail` 变为 `.sidebar`**。

### 2.2 实际移动端 AI 产品的做法

| 产品 | 列表屏入口 | 切换方式 | 备注 |
|---|---|---|---|
| ChatGPT（移动端） | 右滑手势打开侧边栏（线程列表） | 手势 / 侧边栏开关 | 官方社区 feature request 描述该行为，并抱怨"手势灵敏度过高，滚动正文时会误触弹出侧边栏"【二手】[Sensitivity of the swipe gesture to open the sidebar in the ChatGPT Android app is too high](https://community.openai.com/t/sensitivity-of-the-swipe-gesture-to-open-the-sidebar-in-the-chatgpt-android-app-is-too-high/792385)（2024-06-02） |
| Gemini（移动端） | 打开应用即见 "Recent chats" 列表；2025-06 加入导航抽屉 | 抽屉，内含 New chat / Gems / Recent history | 【二手】[Google Adds Navigation Drawer to Gemini App](https://sammyguru.com/google-adds-navigation-drawer-to-gemini-app-for-easier-access/)（2025-06-17，引用 Google 应用 beta 16.23）；[Gemini Quick Guide 描述"On mobile, you'll see a Recent chats list when you open the app."](https://www.spurnow.com/en/blogs/how-to-use-google-gemini) |
| Copilot（移动端） | 2025-08 起移除底部 tab，Copilot Chat 为默认落地页，聊天历史默认展开，其他功能进汉堡菜单 | 汉堡菜单 | 【二手】（同 1.5 节 M365 Admin 来源） |
| Claude（移动端） | 侧边栏含 New chat / Projects / Starred / Recents | 侧边栏 | 【二手】[Claude Projects: Knowledge Files and Scoped Chats](https://www.ai-toolbox.co/claude-management-and-productivity/how-to-use-claude-projects-guide-2026) |

**第三方开源实现的同类做法**（可作"通行做法"的旁证）：LibreChat 官方文档描述其移动端"侧边栏默认以**全屏 drawer** 打开，header 含与对话页相同的侧边栏开关、当前面板名、带标签的面板切换器和账号控件；**搜索出现在底部栏**，与一个拇指可及的 **New chat** 动作并排"【一手·第三方】[Sidebar and Navigation — LibreChat Docs](https://www.librechat.ai/docs/features/navigation)。

### 2.3 返回对话屏时保留哪些状态

- 平台规范层面只承诺**应用状态**（app state）保持，**不细化**到滚动位置或草稿文本【一手】（Android 文档原文仅 "preserving app state"，见 2.1）。
- 逐产品核实"切回时滚动位置/草稿是否保持"：**六个目标产品的官方文档均未描述，未能核实。**
- 反向证据（说明这是行业普遍缺陷、而非稳定契约）：多个产品的用户 bug 报告都指向"切换会话后滚动位置被重置到顶部"——Cursor（2025-08、2026-01 两次）、OpenCode（2026-06）、OpenDesign（2026-05）【二手】[Cursor: Chat view scroll position resets when switching between conversations](https://forum.cursor.com/t/chat-view-scroll-position-resets-when-switching-between-conversations/127336)（2025-08-08）、[Cursor: Retain Scroll Position When Switching Between Agent/Chat Tabs](https://forum.cursor.com/t/retain-scroll-position-when-switching-between-agent-chat-tabs/149136)（2026-01-16）、[OpenCowork #267](https://github.com/OpenCoworkAI/open-cowork/issues/267)（2026-06-22）。
- 另有第三方实现明确把"**每个会话的草稿文本在切换走后仍然保留**"作为设计要点【一手·第三方】[Improve Session Switching UX in OpenClaw Web UI](https://github.com/openclaw/openclaw/issues/84214)（2026-05-19，需求文，非既有产品事实）。

---

## 三、背景推送：引擎在后台推进对话时，列表怎么表现

### 3.1 未读标记（未读点 / 角标 / 加粗）

| 产品 | 机制 | 出处 |
|---|---|---|
| ChatGPT | 侧边栏对话标题上出现**蓝点**，表示"你离开页面之后生成了回复"；多名用户报告该蓝点无法清除、且即使没有未读消息也常驻 | 【二手】[Annoying blue dot unread notification in chatgpt web sidebar](https://community.openai.com/t/annoying-blue-dot-unread-notification-in-chatgpt-web-sidebar/1101950)（2025-01-24 起，同帖持续到 2025-03）、[Threads @testingcatalog](https://www.threads.com/@testingcatalog/post/C_2x5IHtIvr)：原文 "ChatGPT shows blue dots on the conversation history in case you left the conversation before the response was finalised." |
| Telegram | 文件夹（Chat Folders）可设 "Unread" 类型，自动收纳未读会话；文件夹上带未读计数徽标；应用图标角标显示未读数 | 【一手·摘要】[Chat Folders, Archive, Channel Stats and More](https://telegram.org/blog/folders)（2020-03-30，原文含 "You can include or exclude all chats of a particular type, like Channels, or Unread"）；计数行为细节由桌面端 issue 佐证【二手】[tdesktop #28709](https://github.com/telegramdesktop/tdesktop/issues/28709) |
| 移动 OS 通用（iOS 信息 / WhatsApp） | 会话列表上用**蓝点**区分未读；应用图标上显示数字角标；打开会话即清除该会话的未读标记 | 【二手】多来源一致，例如 [iDownloadBlog: How to mark a text message as unread](https://www.idownloadblog.com/2022/09/14/how-to-make-message-as-unread-iphone-mac/) |
| 长时 agent 桌面产品（Hermes Desktop） | 现状是**没有**"后台会话跑完但未读"的持久指示器；已有的琥珀点表示的是相反方向（agent 在等你输入） | 【二手】[Persistent completed-but-unread indicator in Desktop sidebar for background sessions](https://github.com/NousResearch/hermes-agent/issues/43611)（2026-06-10） |

### 3.2 排序上浮 / 重新分组

- **Copilot（一手，最强证据）**：MC1020215 原文 —— 新特性"organize a user's chat history **by the latest interaction in each session**"，且"适用于用户既有 chat history 和任何新建的 chats"。也就是**后台推进会让条目在列表里上浮**到新的时间分组【一手】（来源同 1.5 节）。
- **ChatGPT**：重命名会话会让该条目跳到列表顶部（用户实测帖）【二手】（来源同 1.2 节）。
- **即时通讯类通用**：会话列表按最近一条消息排序、最新活动置顶，为多来源一致的通行做法【二手】（Telegram/WhatsApp 相关教程与文档普遍如此描述）。
- **例外说明**：Copilot 的排序是"按 session 最近交互时间"但分组颗粒度只到"Previous 7 days / Previous 30 days"等粗档，不显示精确时间戳（一手原文）。

### 3.3 有没有"正在进行的对话被自动切换前台"的先例

- **主流 AI 对话产品（ChatGPT / Claude / Gemini / Microsoft 365 Copilot / Kimi / 豆包）**：在本次调研的检索范围内，**未找到任何官方文档或可靠来源**描述"后台推进的会话被自动切到前台"。同样也没有找到明确否认的文档。因此该问题在六个目标产品上的结论是 **未能核实**（既未证实存在，也未证实被排除）。
- **相邻领域确有"自动弹前台"的先例**（这些不是 AI 对话产品，列出供区分）：
  - **站内实时客服组件（Intercom）**：新消息到达时 messenger 会自动弹出。证据是一则用户提问"如何在收到新消息时阻止 Intercom 自动打开"，并指出"自动弹出发生时未读计数被直接清零"【二手】[Prevent Intercom auto opening upon new messages](https://superuser.com/questions/1406511/prevent-intercom-auto-opening-upon-new-messages)（2019-02-16；问题长期未获解决）。
  - **站内实时客服组件（tawk.to）**：同样存在"widget 自动打开"的行为，社区帖为"Preventing widget from opening automatically?"【二手】[tawk.to Community](https://community.tawk.to/t/preventing-widget-from-opening-automatically/3277)（2024-04-11）。
  - **移动操作系统**：来电 / 视频通话会抢占前台（通用行为，未逐条取官方文档，此处仅作领域参照）。
- **反向先例（明确不自动切前台，改用"收件箱"隐喻）**：面向长时运行 agent 的产品 Pizza Bot（Apache-2.0 桌面应用，AWS 工程师开源）采用 email-style inbox 交互模式，而不是把完成的会话弹到前台【二手】[Pizza Bot, a new open-source app gives long-running AI agents an email-style inbox](https://reveneau.com/ainews/pizza-bot-open-source-inbox-background-agents-langgraph-aws)（2026-09-11，项目发布于 2026-09-10）。
- 与"后台推进"相关但**方向相反**的一类指示器：agent 侧等待用户输入的提示（如 Hermes Desktop 的琥珀点表示 `needsInput` / clarify-blocked）【二手】（来源同 3.1）。

---

## 四、未能核实的清单（汇总）

1. **六个产品的空态内容**（侧边栏无会话时、新对话屏）——除 Claude 的 "How can I help you today?" 有多个二手来源外，其余全部未能核实；Claude 那条也未在 Anthropic 官方文档中直接核实。
2. **ChatGPT 当前桌面版侧边栏的时间分组形态**——存在分组的事实有据，但 2025 年后多次改版，当前是 Chats 视图分组还是 Activity 视图，未能核实。
3. **Gemini 空态 / 重命名后排序是否变化 / 是否对会话分组**——未能核实（且 Google 域名当前不可达，只能读摘要）。
4. **Kimi 主站 kimi.com 的标题生成机制、列表时间表达、会话条目的置顶与重命名入口**——官方文档只覆盖了"项目"与 Kimi Code，主站会话条目未能核实。
5. **豆包列表条目的时间表达与空态**；以及"删除是否可直接从列表条目发起"（官方隐私政策只写了对话内路径）。
6. **六个产品在切回对话屏时是否保留滚动位置与草稿文本**——官方文档均未描述，未能核实。
7. **是否存在把后台推进的会话自动切到前台的主流 AI 对话产品先例**——未能核实（检索范围内未找到，等同于既未证实也未证伪）。
8. **版本号**：多数产品为网页版/桌面版滚动更新，官方文档不标注版本号；本文以"文档日期 / 观察日期"代替版本号，逐条已给出。

---

## 五、来源清单（按域名）

**一手（已打开全文）**
- help.openai.com — [Deleting and archiving chats in ChatGPT](https://help.openai.com/en/articles/8809935-deleting-and-archiving-chats-in-chatgpt)（2026-09-22）、[Projects in ChatGPT](https://help.openai.com/en/articles/10169521-projects-in-chatgpt)
- support.anthropic.com — [我如何删除或重命名对话？](https://support.anthropic.com/zh-CN/articles/8230524-%E5%A6%82%E4%BD%95%E5%88%A0%E9%99%A4%E6%88%96%E9%87%8D%E5%91%BD%E5%90%8D%E5%AF%B9%E8%AF%9D)（2026-03-05）
- support.microsoft.com — [How Microsoft Copilot Chat history works](https://support.microsoft.com/en-us/microsoft-365-copilot/how-microsoft-365-copilot-chat-history-works)（2026-07-15）、[Frequently asked questions about Microsoft 365 Copilot Chat](https://support.microsoft.com/en-us/microsoft-365-copilot/frequently-asked-questions-about-microsoft-365-copilot-chat)（2026-07-15）
- kimi.com — [项目（Project）](https://www.kimi.com/help/features/project)（2026-09-18）、[模型选择与对话入门](https://www.kimi.com/help/new-user-guide/agentic-chat)（2026-09-18）、[对话常见问题与排查](https://www.kimi.com/help/others/chat-issues)（2026-09-18）、[Kimi Code CLI 会话管理与上下文](https://www.kimi.com/help/kimi-code/cli-sessions)（2026-09-18）、[Kimi Code 变更记录](https://www.kimi.com/code/docs/kimi-code-cli/changelog)（2026-09-19）
- doubao.com — [隐私政策](https://www.doubao.com/legal/privacy)（更新 2026-09-10 / 生效 2026-09-17）
- developer.android.google.cn — [Canonical layouts（大屏）](https://developer.android.google.cn/guide/topics/large-screens/large-screen-canonical-layouts?hl=en)
- developer.apple.com — [NavigationSplitView](https://developer.apple.com/documentation/swiftui/navigationsplitview)
- librechat.ai — [Sidebar and Navigation](https://www.librechat.ai/docs/features/navigation)（第三方开源项目）
- Microsoft 365 Message Center MC1020215（Roadmap ID 477358），全文经 [kbworks.eu](https://kbworks.eu/microsoft-roadmap-messagecenter-and-blogs-updates-from-19-03-2025/) 转载（2025-03-19）

**一手·摘要（域名属厂商，页面当前不可达）**
- support.google.com — [Find & manage your recent chats in Gemini Apps - Computer](https://support.google.com/gemini/answer/13666746?hl=en)、[Grouping of Chats in Gemini](https://support.google.com/gemini/thread/406520194/grouping-of-chats-in-gemini?hl=en)（2026-02-01）
- gemini.google.com — [Gemini Apps' release updates and improvements](https://gemini.google.com/updates?hl=en-CA)（2025-08-21 条目）
- telegram.org — [Chat Folders, Archive, Channel Stats and More](https://telegram.org/blog/folders)（2020-03-30）
- m3.material.io — [Canonical layout examples](https://m3.material.io/foundations/adaptive-design/canonical-layouts)

**二手（≥2 个独立来源才写入正文）**
- community.openai.com、threads.com、superuser.com、tawk.to、forum.cursor.com、github.com（各厂商官方仓库 issue）、pcmag.com、computerworld.com、northlabapps.com、gptmaster.app、ai-toolbox.co、llmnesia.com、guideflow.com、meetjamie.ai、fahimai.com、spurnow.com、sammyguru.com、m365admin.handsontek.net、app.cloudscout.one、zhuanlan.zhihu.com、chooseai.net、mydown.yesky.com、php.cn、sjds.net、doubao-wang.cn、reveneau.com
