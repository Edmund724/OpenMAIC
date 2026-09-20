# Mission: 吃透 OpenMAIC 的交互采集与学生画像设计，造自己的系统

## Why
用户想借鉴 OpenMAIC（清华 MAIC 论文的开源实现）的交互采集与学生建模设计，用于构建自己的系统。需要理解的不只是"采集了什么"，而是每个设计决策背后的取舍——哪些该让 LLM 判断、哪些该是确定性代码、事件如何落库与重放——以便在自己的系统里做出有依据的选择。

## Success looks like
- 能准确说出每个 engagement 事件的定义、生产者（runtime / LLM 工具 / 确定性代码）和下游消费路径
- 能复述"LLM 观察、代码计分"、at-least-once 账本 + fold 重放、设备匿名 learner key 等核心机制及其取舍
- 能判断哪些设计值得借鉴到自己的系统，哪些是论文有而开源缺失、需要自己另补的

## Constraints
- 中文教学；每课聚焦一个可快速完成的小主题
- 一切结论必须有 file:line 源码证据或论文出处，不接受转述二手结论

## Out of scope
- 课件生成管线（slide/interactive 生成）的内部细节
- 前端 UI 组件实现
