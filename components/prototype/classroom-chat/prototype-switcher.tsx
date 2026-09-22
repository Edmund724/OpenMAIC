'use client';

/**
 * 原型切换器（wayfinder 票 P1）。浮在屏幕底部中间，明显不属于被评估的设计。
 * 只改 URL 上的 ?variant=，因此可分享、刷新稳定。生产构建下不渲染。
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StatusBarState } from './status-bar';

export const VARIANT_ORDER = ['current', 'A', 'B', 'C'] as const;
export type VariantKey = (typeof VARIANT_ORDER)[number];

export const VARIANT_NAMES: Record<VariantKey, string> = {
  current: '改造前（现状）',
  A: '两屏切换',
  B: '历史浮层',
  C: '上下分栏',
};

/** 每个变体的结构差异，一句话——比配色差异重要得多。 */
export const VARIANT_NOTES: Record<VariantKey, string> = {
  current: '会话卡片列表 · 面板里没有输入框',
  A: '列表屏 ↔ 对话屏，输入区钉在对话屏底部',
  B: '对话常驻，历史从顶部盖下来一层浮层',
  C: '列表常驻上半部（可折叠）+ 对话 + 输入区',
};

const BASE_PATH = '/prototype/classroom-chat';

export function buildUrl(params: Record<string, string>, patch: Record<string, string>): string {
  const search = new URLSearchParams(params);
  for (const [key, value] of Object.entries(patch)) {
    if (value) search.set(key, value);
    else search.delete(key);
  }
  const query = search.toString();
  return query ? `${BASE_PATH}?${query}` : BASE_PATH;
}

export function PrototypeSwitcher({
  current,
  params,
}: {
  readonly current: VariantKey;
  readonly params: Record<string, string>;
}) {
  const router = useRouter();

  const step = (direction: number) => {
    const index = VARIANT_ORDER.indexOf(current);
    const next = VARIANT_ORDER[(index + direction + VARIANT_ORDER.length) % VARIANT_ORDER.length];
    router.replace(buildUrl(params, { variant: next }), { scroll: false });
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const tag = target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) return;
      event.preventDefault();
      step(event.key === 'ArrowLeft' ? -1 : 1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  if (process.env.NODE_ENV === 'production') return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[100] -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-full bg-gray-900 px-1.5 py-1 text-white shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
        <button
          onClick={() => step(-1)}
          aria-label="上一个变体"
          className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/15 active:scale-90"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="min-w-[300px] px-2 text-center">
          <div className="text-[11px] font-semibold tracking-wide">
            {current} · {VARIANT_NAMES[current]}
          </div>
          <div className="text-[9px] text-white/60">{VARIANT_NOTES[current]}</div>
          <div className="text-[9px] text-white/35">← → 切换 · 原型，非产品界面</div>
        </div>
        <button
          onClick={() => step(1)}
          aria-label="下一个变体"
          className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/15 active:scale-90"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/** 原型专用的开关条：把 P1 票要求走通的几条路暴露成一键切换。 */
export function StateControls({
  params,
  flags,
}: {
  readonly params: Record<string, string>;
  readonly flags: PrototypeFlags;
}) {
  const router = useRouter();

  const setParam = (key: string, value: string) => {
    router.replace(buildUrl(params, { [key]: value }), { scroll: false });
  };

  const items: Array<{ key: string; label: string; on: boolean; value?: string }> = [
    { key: 'rec', label: '录音态', on: flags.recording },
    { key: 'cue', label: '轮到你了', on: flags.cueUser },
    { key: 'empty', label: '空对话', on: flags.emptyConversation },
    { key: 'fs', label: '全屏讲课', on: flags.fullscreen },
    { key: 'narrow', label: '窄面板 240px', on: flags.narrowPanel },
    { key: 'new', label: '有新内容 ↓', on: flags.newContent },
    { key: 'bar', value: 'stop', label: '状态条·活跃', on: flags.statusBar === 'stop' },
    { key: 'bar', value: 'continue', label: '状态条·续接', on: flags.statusBar === 'continue' },
    { key: 'bar', value: 'other', label: '状态条·另一端', on: flags.statusBar === 'other' },
  ];

  if (process.env.NODE_ENV === 'production') return null;

  return (
    <div className="fixed top-3 left-1/2 z-[100] -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-full border border-black/10 bg-white/90 px-2 py-1 shadow-sm backdrop-blur">
        <span className="px-1 text-[10px] font-semibold text-gray-400">状态</span>
        {items.map((item) => (
          <button
            key={item.label}
            onClick={() => setParam(item.key, item.on ? '' : (item.value ?? '1'))}
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors',
              item.on
                ? 'bg-purple-600 text-white'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export interface PrototypeFlags {
  readonly recording: boolean;
  readonly cueUser: boolean;
  readonly emptyConversation: boolean;
  readonly fullscreen: boolean;
  readonly narrowPanel: boolean;
  readonly newContent: boolean;
  readonly statusBar: StatusBarState;
}

export function readFlags(params: Record<string, string>): PrototypeFlags {
  const bar = params.bar;
  return {
    recording: params.rec === '1',
    cueUser: params.cue === '1',
    emptyConversation: params.empty === '1',
    fullscreen: params.fs === '1',
    narrowPanel: params.narrow === '1',
    newContent: params.new === '1',
    statusBar: bar === 'stop' || bar === 'continue' || bar === 'other' ? bar : 'none',
  };
}
