'use client';

/**
 * 原型滚动容器（补画 G1 已定、P1 没画过的画面）：消息流贴底才跟随，
 * 手动上翻过则出「有新内容 ↓」。
 * 由 URL 开关 ?new=1 演示：开关打开时追加两条引擎新写入的消息，并把视口停在它们之上。
 */

import { useEffect, useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { MessageFlow } from './message-flow';
import type { MockMessage, MockSession } from './mock-data';

/** ?new=1 时追加的四条消息——模拟引擎在学生上翻期间把发言写进了当前会话。 */
const NEW_MESSAGES: readonly MockMessage[] = [
  {
    id: 'new-1',
    role: 'peer',
    name: '小林',
    text: '我用红黑树写的那个 map，插十万条确实比 AVL 快一点。',
    time: '14:04',
  },
  {
    id: 'new-2',
    role: 'teacher',
    name: '张老师',
    text: '这就是取舍落到工程上的样子——标准库选红黑树不是因为查询更快，而是写路径更短。',
    time: '14:04',
  },
  {
    id: 'new-3',
    role: 'peer',
    name: '小林',
    text: '那 Java 的 TreeMap 用的也是红黑树吧？',
    time: '14:05',
  },
  {
    id: 'new-4',
    role: 'teacher',
    name: '张老师',
    text: '对，TreeMap 和 C++ 的 std::map 都是红黑树。想真正体会差别，把同一组数据分别插进两种树、打印旋转次数——这个实验比看结论有用得多。',
    time: '14:05',
  },
];

export function MessageScroll({
  session,
  empty,
  newContent,
}: {
  readonly session: MockSession;
  readonly empty: boolean;
  readonly newContent: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(!newContent);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // 演示态：把视口停在最后两条新消息之上，等价于「学生上翻过、没跟上」
    el.scrollTop = newContent
      ? Math.max(0, el.scrollHeight - el.clientHeight - 200)
      : el.scrollHeight;

    const onScroll = () => setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 24);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [newContent, session.id]);

  const scrollToBottom = () => {
    // 直接落到底：原型里不用平滑滚动（窗口失焦时它会被浏览器跳过）
    setAtBottom(true);
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  };

  const shown = newContent
    ? { ...session, messages: [...session.messages, ...NEW_MESSAGES] }
    : session;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div ref={ref} className="min-h-0 flex-1 overflow-y-auto">
        <MessageFlow session={shown} empty={empty} />
      </div>
      {newContent && !atBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-gray-900/85 px-2.5 py-1 text-[10px] font-medium text-white shadow-lg backdrop-blur hover:bg-gray-900"
        >
          有新内容
          <ArrowDown className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
