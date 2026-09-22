'use client';

/**
 * 原型消息流与历史列表（wayfinder 票 P1）。四个变体共用这两个"内容"组件，
 * 变体之间的差别在于它们和输入区怎么在面板里分配空间。
 */

import { MessageSquare, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AvatarDisplay } from '@/components/ui/avatar-display';
import { GROUP_LABELS, type MockMessage, type MockSession } from './mock-data';

export function MessageFlow({
  session,
  empty,
  typing = false,
}: {
  readonly session: MockSession;
  readonly empty: boolean;
  /** 引擎正在生成时才在末尾出三点流式指示（照真实产品：`chat-session.tsx:70-101`） */
  readonly typing?: boolean;
}) {
  if (empty) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-400">
          <Sparkles className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium text-gray-700">开始一段新对话</p>
        <p className="mt-1 text-xs text-gray-400">问老师任何关于这一页的问题</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 px-3 py-3">
      {session.messages.map((message) => (
        <MessageRow key={message.id} message={message} />
      ))}
      {typing && (
        // 三点流式指示：照真实产品 `chat-session.tsx:71-100`（首字前的那三点），不出文字行
        <div className="flex items-center gap-1.5 px-1 py-1.5">
          {[0, 200, 400].map((delay) => (
            <span
              key={delay}
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-400/70"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MessageRow({ message }: { readonly message: MockMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={cn('flex gap-2', isUser && 'flex-row-reverse')}>
      <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-gray-100 text-base">
        <AvatarDisplay
          src={
            isUser
              ? '/avatars/user.png'
              : message.role === 'peer'
                ? '/avatars/student1.svg'
                : '/avatars/teacher.png'
          }
          alt={message.name}
        />
      </div>
      <div className={cn('min-w-0 max-w-[82%]', isUser && 'items-end text-right')}>
        <div className="mb-0.5 flex items-center gap-1.5 text-[10px] text-gray-400">
          <span className={cn(isUser && 'order-2')}>{message.name}</span>
          <span>{message.time}</span>
        </div>
        <div
          className={cn(
            'rounded-2xl px-3 py-2 text-left text-xs leading-relaxed',
            isUser
              ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white'
              : message.role === 'peer'
                ? 'bg-indigo-50 text-gray-800'
                : 'border border-gray-100 bg-white text-gray-800 shadow-sm',
          )}
        >
          <span className="whitespace-pre-wrap break-words">{message.text}</span>
          {message.interrupted && (
            <span className="ml-1 align-middle text-[9px] text-red-500">已中断</span>
          )}
          {message.actionTag && (
            <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[9px] font-medium text-purple-600">
              <Sparkles className="h-2.5 w-2.5" />
              {message.actionTag}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function HistoryList({
  sessions,
  currentId,
  onPick,
  onRename,
  onHide,
  compact = false,
}: {
  readonly sessions: readonly MockSession[];
  readonly currentId: string;
  readonly onPick: (id: string) => void;
  readonly onRename: (id: string) => void;
  readonly onHide: (id: string) => void;
  readonly compact?: boolean;
}) {
  const groups: Array<MockSession['group']> = ['today', 'yesterday', 'earlier'];
  return (
    <div className={cn('space-y-3', compact ? 'px-2 py-2' : 'px-3 py-3')}>
      {groups.map((group) => {
        const rows = sessions.filter((session) => session.group === group);
        if (rows.length === 0) return null;
        return (
          <div key={group}>
            <div className="mb-1 px-1 text-[10px] font-semibold tracking-wide text-gray-400">
              {GROUP_LABELS[group]}
            </div>
            <div className="space-y-0.5">
              {rows.map((session) => (
                <HistoryRow
                  key={session.id}
                  session={session}
                  active={session.id === currentId}
                  onPick={onPick}
                  onRename={onRename}
                  onHide={onHide}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HistoryRow({
  session,
  active,
  onPick,
  onRename,
  onHide,
}: {
  readonly session: MockSession;
  readonly active: boolean;
  readonly onPick: (id: string) => void;
  readonly onRename: (id: string) => void;
  readonly onHide: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        'group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors',
        active ? 'bg-purple-50' : 'hover:bg-gray-50',
      )}
    >
      <button onClick={() => onPick(session.id)} className="min-w-0 flex-1 text-left">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              'h-1.5 w-1.5 shrink-0 rounded-full',
              session.status === 'live'
                ? 'bg-green-500'
                : session.status === 'interrupted'
                  ? 'bg-yellow-500'
                  : 'bg-gray-300',
            )}
          />
          <span
            className={cn(
              'truncate text-xs',
              active ? 'font-semibold text-purple-700' : 'text-gray-700',
            )}
          >
            {session.title}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 pl-3 text-[10px] text-gray-400">
          <span
            className={cn(
              'rounded px-1 py-px font-bold uppercase',
              session.kind === 'qa'
                ? 'bg-blue-50 text-blue-600'
                : 'bg-amber-50 text-amber-600',
            )}
          >
            {session.kind === 'qa' ? 'Q&A' : '讨论'}
          </span>
          <span>{session.time}</span>
        </div>
      </button>
      <button
        onClick={() => onRename(session.id)}
        title="重命名"
        className="hidden text-[10px] text-gray-400 group-hover:block hover:text-gray-700"
      >
        改名
      </button>
      <button
        onClick={() => onHide(session.id)}
        title="隐藏"
        className="hidden text-[10px] text-gray-400 group-hover:block hover:text-red-500"
      >
        隐藏
      </button>
    </div>
  );
}

export function EmptyHistory() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center opacity-60">
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-300">
        <MessageSquare className="h-5 w-5" />
      </div>
      <p className="text-xs text-gray-500">还没有对话</p>
    </div>
  );
}
