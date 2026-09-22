'use client';

/**
 * 面板（wayfinder 票 P1 选定的变体 B）：对话常驻，历史从面板顶部盖下来一层浮层，
 * 学生永远不离开对话屏。落选的 A（两屏切换）与 C（上下分栏）留在 throwaway 分支
 * `prototype/classroom-chat-panel-variants`，main 只留这一个形态。
 */

import { useState, type ReactNode } from 'react';
import {
  BookOpen,
  ChevronDown,
  History,
  MessageSquare,
  PanelRightClose,
  Plus,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Composer, type ComposerProps } from './composer';
import { HistoryList } from './message-flow';
import { MessageScroll } from './message-scroll';
import { CURRENT_SESSION, type MockSession } from './mock-data';
import type { PrototypeFlags } from './state-controls';
import { StatusBar } from './status-bar';

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

/** 消息流（贴底才跟随，上翻过出「有新内容 ↓」）+ 细状态条 + 输入区。 */
function ConversationPane({ shared }: { readonly shared: PanelShared }) {
  return (
    <>
      <MessageScroll
        session={shared.currentSession}
        empty={shared.empty}
        newContent={shared.flags.newContent}
        typing={shared.flags.statusBar === 'stop'}
      />
      <div className="shrink-0 border-t border-gray-100 p-2">
        <StatusBar
          key={shared.flags.statusBar}
          state={shared.flags.statusBar}
          onStop={() => undefined}
          onContinue={() => undefined}
          onBack={() => shared.onPickSession(CURRENT_SESSION.id)}
        />
        <Composer {...shared.composer} />
      </div>
    </>
  );
}

export function Panel({ shared }: { readonly shared: PanelShared }) {
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

      <ConversationPane shared={shared} />

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
