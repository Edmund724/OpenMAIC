/**
 * 一次性原型路由（wayfinder 票 P1）：确认"学生发言搬进对话 tab"之后的观感。
 *
 * 假数据、无持久化、不引用任何现有课堂逻辑（roundtable / use-chat-sessions /
 * PlaybackChromeRoot 一行都不改）。验证完就删，或整体挪到 throwaway 分支。
 *
 * 用法：`pnpm dev` 后打开
 *   /prototype/classroom-chat                    → 改造前
 *   /prototype/classroom-chat?variant=A          → 两屏切换
 *   /prototype/classroom-chat?variant=B          → 历史浮层
 *   /prototype/classroom-chat?variant=C          → 上下分栏
 * 状态开关（可叠加）：&rec=1 录音态 / &cue=1 轮到你了 / &empty=1 空对话 /
 *   &fs=1 全屏讲课 / &narrow=1 窄面板 240px
 * 底部黑条上左右箭头或键盘 ← → 切换变体。
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
