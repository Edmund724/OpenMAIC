'use client';

/**
 * 四个面板变体（wayfinder 票 P1）。差别不在配色，而在**历史对话和当前对话怎么
 * 在同一块面板里分空间**——这正是用户抱怨的那件事。
 *
 * current：改造前的现状（会话卡片列表，面板里没有输入框）
 * A       ：两屏切换（列表屏 ↔ 对话屏），输入区钉在对话屏底部
 * B       ：对话常驻，历史从顶部盖下来一层浮层
 * C       ：上下分栏，列表常驻上半部（可折叠）+ 对话 + 输入区
 */

import { useState, type ReactNode } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  Circle,
  CheckCircle,
  Clock,
  History,
  MessageSquare,
  PanelRightClose,
  Plus,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Composer, type ComposerProps } from './composer';
import { EmptyHistory, HistoryList, MessageFlow } from './message-flow';
import type { MockSession } from './mock-data';
import type { PrototypeFlags } from './prototype-switcher';

export interface PanelShared {
  readonly flags: PrototypeFlags;
  readonly sessions: readonly MockSession[];
  readonly currentId: string;
  readonly currentSession: MockSession;
  readonly empty: boolean;
  readonly onPickSession: (id: string) => void;
  readonly onNewChat: () => void;
  readonly composer: ComposerProps;
}

function TabButton({
  icon,
  label,
  active,
  dot,
}: {
  readonly icon: ReactNode;
  readonly label: string;
  readonly active?: boolean;
  readonly dot?: boolean;
}) {
  return (
    <button
      className={cn(
        'relative flex h-full flex-1 items-center justify-center gap-1 border-b-2 text-xs transition-colors',
        active
          ? 'border-purple-500 font-medium text-gray-900'
          : 'border-transparent text-gray-400 hover:text-gray-600',
      )}
    >
      {icon}
      {label}
      {dot && (
        <span className="absolute -top-0.5 right-2 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
        </span>
      )}
    </button>
  );
}

function PanelTabs({ amberDot }: { readonly amberDot?: boolean }) {
  return (
    <div className="mt-3 mb-1 flex h-10 shrink-0 items-center gap-1 px-3">
      <div className="flex h-full w-0 flex-1 items-center">
        <TabButton icon={<BookOpen className="h-3.5 w-3.5" />} label="笔记" />
        <TabButton
          icon={<MessageSquare className="h-3.5 w-3.5" />}
          label="对话"
          active
          dot={amberDot}
        />
      </div>
      <button className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100/80 text-gray-500 ring-1 ring-black/[0.04]">
        <PanelRightClose className="w-4 h-4" />
      </button>
    </div>
  );
}

function PanelHeaderButton({
  icon,
  label,
  onClick,
  title,
}: {
  readonly icon: ReactNode;
  readonly label: string;
  readonly onClick?: () => void;
  readonly title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title ?? label}
      className="flex items-center gap-1 rounded-full border border-gray-200 px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-50"
    >
      {icon}
      {label}
    </button>
  );
}

const STATUS_ICON: Record<MockSession['status'], ReactNode> = {
  live: <Circle className="size-2.5 fill-green-500 text-green-500" />,
  interrupted: <Clock className="size-2.5 text-yellow-500" />,
  ended: <CheckCircle className="size-2.5 text-gray-400" />,
};

/* ── current：改造前的现状 ───────────────────────────────────────────── */

export function VariantCurrent({ shared }: { readonly shared: PanelShared }) {
  const [expanded, setExpanded] = useState<string | null>(shared.currentId);
  return (
    <div className="flex h-full flex-col">
      <PanelTabs amberDot={shared.flags.cueUser} />
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {shared.sessions.map((session) => (
          <div
            key={session.id}
            className={cn(
              'overflow-hidden rounded-xl border transition-all',
              session.status === 'live'
                ? 'border-purple-200 bg-purple-50/30 shadow-sm'
                : 'border-gray-100 bg-white/50',
            )}
          >
            <button
              onClick={() => setExpanded(expanded === session.id ? null : session.id)}
              className="flex w-full items-center gap-1.5 px-3 py-2 text-left hover:bg-gray-50/50"
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
              <span className="shrink-0 rounded bg-blue-100 px-1.5 py-px text-[8px] font-extrabold tracking-wider text-blue-700 uppercase">
                Q&amp;A
              </span>
              <span className="flex-1 truncate text-[11px] font-semibold text-gray-700">
                {session.title}
              </span>
              {STATUS_ICON[session.status]}
              <span className="shrink-0 text-[9px] text-gray-400 tabular-nums">
                {session.messages.length}
              </span>
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform',
                  expanded !== session.id && '-rotate-90',
                )}
              />
            </button>
            {expanded === session.id && (
              <div className="border-t border-gray-100/50 px-2 pt-1 pb-2">
                <MessageFlow session={session} empty={false} />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="shrink-0 border-t border-dashed border-gray-200 px-3 py-2 text-center text-[10px] leading-tight text-gray-400">
        改造前：面板里没有输入框
        <br />
        学生要去底部横条点气泡或麦克风
      </div>
    </div>
  );
}

/* ── A：两屏切换 ─────────────────────────────────────────────────────── */

export function VariantA({ shared }: { readonly shared: PanelShared }) {
  const [screen, setScreen] = useState<'conversation' | 'list'>('conversation');
  const onList = screen === 'list';
  return (
    <div className="flex h-full flex-col">
      <PanelTabs amberDot={shared.flags.cueUser} />

      <div className="flex shrink-0 items-center gap-1.5 px-3 pb-2">
        <PanelHeaderButton
          icon={onList ? <ChevronLeft className="h-3.5 w-3.5" /> : <History className="h-3.5 w-3.5" />}
          label={onList ? '返回对话' : '历史对话'}
          onClick={() => setScreen(onList ? 'conversation' : 'list')}
        />
        <div className="flex-1" />
        <PanelHeaderButton
          icon={<Plus className="h-3.5 w-3.5" />}
          label="新对话"
          onClick={() => {
            shared.onNewChat();
            setScreen('conversation');
          }}
        />
      </div>

      {onList ? (
        <div className="flex-1 overflow-y-auto">
          {shared.sessions.length === 0 ? (
            <EmptyHistory />
          ) : (
            <HistoryList
              sessions={shared.sessions}
              currentId={shared.currentId}
              onPick={(id) => {
                shared.onPickSession(id);
                setScreen('conversation');
              }}
              onRename={() => undefined}
              onHide={() => undefined}
            />
          )}
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto">
            <MessageFlow session={shared.currentSession} empty={shared.empty} />
          </div>
          <div className="shrink-0 border-t border-gray-100 p-2">
            <Composer {...shared.composer} />
          </div>
        </>
      )}
    </div>
  );
}

/* ── B：历史浮层 ─────────────────────────────────────────────────────── */

export function VariantB({ shared }: { readonly shared: PanelShared }) {
  const [historyOpen, setHistoryOpen] = useState(false);
  return (
    <div className="relative flex h-full flex-col">
      <PanelTabs amberDot={shared.flags.cueUser} />

      <div className="flex shrink-0 items-center gap-1.5 px-3 pb-2">
        <button
          onClick={() => setHistoryOpen((open) => !open)}
          className="flex min-w-0 flex-1 items-center gap-1 rounded-full border border-gray-200 px-2 py-1 text-[11px] text-gray-700 hover:bg-gray-50"
        >
          <History className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          <span className="truncate">{shared.currentSession.title}</span>
          <ChevronDown
            className={cn('h-3 w-3 shrink-0 text-gray-400', historyOpen && 'rotate-180')}
          />
        </button>
        <PanelHeaderButton
          icon={<Plus className="h-3.5 w-3.5" />}
          label="新对话"
          onClick={shared.onNewChat}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <MessageFlow session={shared.currentSession} empty={shared.empty} />
      </div>
      <div className="shrink-0 border-t border-gray-100 p-2">
        <Composer {...shared.composer} />
      </div>

      {historyOpen && (
        <>
          <div className="absolute inset-0 z-10 bg-black/5" onClick={() => setHistoryOpen(false)} />
          <div className="absolute inset-x-2 top-[100px] z-20 flex max-h-[62%] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-3 py-2">
              <span className="text-[11px] font-medium text-gray-600">历史对话</span>
              <button
                onClick={() => setHistoryOpen(false)}
                className="flex h-5 w-5 items-center justify-center rounded text-gray-400 hover:bg-gray-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <HistoryList
                sessions={shared.sessions}
                currentId={shared.currentId}
                onPick={(id) => {
                  shared.onPickSession(id);
                  setHistoryOpen(false);
                }}
                onRename={() => undefined}
                onHide={() => undefined}
                compact
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ── C：上下分栏 ─────────────────────────────────────────────────────── */

export function VariantC({ shared }: { readonly shared: PanelShared }) {
  const [listOpen, setListOpen] = useState(true);
  return (
    <div className="flex h-full flex-col">
      <PanelTabs amberDot={shared.flags.cueUser} />

      <div
        className={cn(
          'flex shrink-0 flex-col border-b border-gray-100',
          listOpen ? 'h-[38%]' : 'h-auto',
        )}
      >
        <div className="flex shrink-0 items-center gap-1.5 px-3 py-1.5">
          <button
            onClick={() => setListOpen((open) => !open)}
            className="flex items-center gap-1 text-[11px] font-medium text-gray-600 hover:text-gray-900"
          >
            <ChevronDown className={cn('h-3 w-3 transition-transform', !listOpen && '-rotate-90')} />
            对话列表
            <span className="text-gray-400">({shared.sessions.length})</span>
          </button>
          <div className="flex-1" />
          <PanelHeaderButton
            icon={<Plus className="h-3.5 w-3.5" />}
            label="新对话"
            onClick={shared.onNewChat}
          />
        </div>
        {listOpen && (
          <div className="min-h-0 flex-1 overflow-y-auto border-t border-gray-50">
            <HistoryList
              sessions={shared.sessions}
              currentId={shared.currentId}
              onPick={shared.onPickSession}
              onRename={() => undefined}
              onHide={() => undefined}
              compact
            />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <MessageFlow session={shared.currentSession} empty={shared.empty} />
      </div>
      <div className="shrink-0 border-t border-gray-100 p-2">
        <Composer {...shared.composer} />
      </div>
    </div>
  );
}
