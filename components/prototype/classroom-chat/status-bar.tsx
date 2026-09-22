'use client';

/**
 * 原型状态条（补画 G1 已定、P1 没画过的画面）。坐在输入区正上方的一条细带，
 * 承载「停止 / 继续（带倒计时）/ 另一端还有讨论在进行 · 回去」。
 * 由 URL 开关 ?bar=stop|continue|other 驱动，不开关时不渲染。
 */

import { useEffect, useState } from 'react';
import { Circle, ListRestart, MessageSquare, Play } from 'lucide-react';

export type StatusBarState = 'none' | 'stop' | 'continue' | 'other';

const SOFT_CLOSING_SECONDS = 12;

const ACTION_CLASS =
  'flex h-5 shrink-0 items-center gap-1 rounded-full border border-gray-200 bg-white px-2 text-[10px] font-medium text-gray-600 hover:bg-gray-50';

export function StatusBar({
  state,
  onStop,
  onContinue,
  onBack,
}: {
  readonly state: StatusBarState;
  readonly onStop: () => void;
  readonly onContinue: () => void;
  readonly onBack: () => void;
}) {
  const [seconds, setSeconds] = useState(SOFT_CLOSING_SECONDS);

  useEffect(() => {
    if (state !== 'continue') return;
    const timer = setInterval(() => setSeconds((value) => (value > 0 ? value - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [state]);

  if (state === 'none') return null;

  return (
    <div className="mb-1.5 flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50/80 px-2 py-1">
      {state === 'stop' && (
        <>
          <Circle className="h-2.5 w-2.5 shrink-0 animate-pulse fill-purple-500 text-purple-500" />
          <span className="min-w-0 flex-1 truncate text-[10px] text-gray-500">
            张老师正在回答…
          </span>
          <button onClick={onStop} className={ACTION_CLASS}>
            停止
          </button>
        </>
      )}

      {state === 'continue' && (
        <>
          <MessageSquare className="h-3 w-3 shrink-0 text-amber-500" />
          <span className="min-w-0 flex-1 truncate text-[10px] text-gray-500">
            这段讨论还有 <span className="font-semibold tabular-nums">{seconds}s</span> 结束
          </span>
          <button onClick={onContinue} className={ACTION_CLASS}>
            <Play className="h-2.5 w-2.5 fill-current" />
            继续
          </button>
        </>
      )}

      {state === 'other' && (
        <>
          <ListRestart className="h-3 w-3 shrink-0 text-purple-500" />
          <span className="min-w-0 flex-1 truncate text-[10px] text-gray-500">
            另一端还有讨论在进行
          </span>
          <button onClick={onBack} className={ACTION_CLASS}>
            回去
          </button>
        </>
      )}
    </div>
  );
}
