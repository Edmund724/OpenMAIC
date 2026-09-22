/**
 * 一次性原型路由（wayfinder 票 P1）：确认"学生发言搬进对话 tab"之后的观感。
 *
 * 假数据、无持久化、不引用任何现有课堂逻辑（roundtable / use-chat-sessions /
 * PlaybackChromeRoot 一行都不改）。形态是 P1 选定的变体 B（历史浮层）；落选的
 * A / C 留在分支 `prototype/classroom-chat-panel-variants`。
 *
 * 用法：`pnpm dev` 后打开 `/prototype/classroom-chat`
 * 状态开关（可叠加）：&rec=1 录音态 / &cue=1 轮到你了 / &empty=1 空对话 /
 *   &fs=1 全屏讲课 / &narrow=1 窄面板 240px /
 *   &bar=stop|continue|other 输入区上方状态条（活跃 / 续接倒计时 / 另一端在进行）/
 *   &new=1 消息流「有新内容 ↓」
 */
import { PrototypeShell } from '@/components/prototype/classroom-chat/prototype-shell';

export const dynamic = 'force-dynamic';

export default async function ClassroomChatPrototypePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;
  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(resolved)) {
    if (typeof value === 'string') params[key] = value;
    else if (Array.isArray(value) && value[0]) params[key] = value[0];
  }

  return <PrototypeShell params={params} />;
}
