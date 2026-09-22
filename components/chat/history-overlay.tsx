'use client';

/**
 * The conversation list, laid over the panel instead of replacing it: the
 * student never leaves the conversation screen, and the list cannot be left
 * "open" by an engine action — only by the student (a pick, a close, or the
 * backdrop).
 *
 * No per-row time column: the day heading carries the day, the row carries the
 * name (its full timestamp only in the `title`). No hiding and no deleting — a
 * classroom record only ever grows.
 */
import { useState } from 'react';
import { Check, Circle, Clock, AlertCircle, History, Plus, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { ChatSession, SessionStatus } from '@/lib/types/chat';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/hooks/use-i18n';
import { groupSessionsByDay, type DayGroupLabel } from '@/lib/chat/session-groups';

interface HistoryOverlayProps {
  readonly open: boolean;
  readonly sessions: ChatSession[];
  readonly displaySessionId: string | null;
  /** When the list was opened — the day boundary must not move under the reader. */
  readonly openedAt: number;
  readonly onSelect: (sessionId: string) => void;
  readonly onNew: () => void;
  readonly onRename: (sessionId: string, title: string) => void;
  readonly onClose: () => void;
}

const BADGE_STYLES: Record<ChatSession['type'], string> = {
  qa: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  discussion: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  lecture: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
};

const GROUP_LABEL_KEYS: Record<DayGroupLabel, string> = {
  today: 'chat.history.today',
  yesterday: 'chat.history.yesterday',
  earlier: 'chat.history.earlier',
};

function StatusDot({ status }: { readonly status: SessionStatus }) {
  switch (status) {
    case 'active':
      return <Circle className="size-2 shrink-0 fill-green-500 text-green-500" />;
    case 'soft-closing':
      return <Circle className="size-2 shrink-0 animate-pulse fill-amber-500 text-amber-500" />;
    case 'interrupted':
      return <Clock className="size-2 shrink-0 text-yellow-500" />;
    case 'error':
      return <AlertCircle className="size-2 shrink-0 text-red-500" />;
    default:
      return <Check className="size-2 shrink-0 text-gray-300 dark:text-gray-600" />;
  }
}

export function HistoryOverlay({
  open,
  sessions,
  displaySessionId,
  openedAt,
  onSelect,
  onNew,
  onRename,
  onClose,
}: HistoryOverlayProps) {
  const { t } = useI18n();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const groups = openedAt ? groupSessionsByDay(sessions, openedAt) : [];

  const commitRename = (sessionId: string) => {
    onRename(sessionId, draft);
    setEditingId(null);
  };

  // Closing is the only exit: it also drops a half-typed rename, so the next
  // open starts clean.
  const closeOverlay = () => {
    setEditingId(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="chat-history-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-30"
        >
          <div className="absolute inset-0 bg-black/5 dark:bg-black/30" onClick={closeOverlay} />
          <div
            data-testid="chat-history-overlay"
            role="dialog"
            aria-label={t('chat.history.title')}
            className="absolute inset-x-2 top-[100px] z-20 flex max-h-[62%] flex-col overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
          >
            <div className="flex shrink-0 items-center gap-1 border-b border-gray-100 dark:border-gray-800 px-3 py-2">
              <History className="h-3.5 w-3.5 text-gray-400" />
              <span className="flex-1 text-[11px] font-medium text-gray-600 dark:text-gray-300">
                {t('chat.history.title')}
              </span>
              <button
                type="button"
                data-testid="chat-history-new"
                onClick={() => {
                  onNew();
                  closeOverlay();
                }}
                className="flex items-center gap-1 rounded-full border border-gray-200 dark:border-gray-700 px-2 py-0.5 text-[11px] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Plus className="h-3 w-3" />
                {t('chat.history.newTalk')}
              </button>
              <button
                type="button"
                onClick={closeOverlay}
                aria-label={t('common.close')}
                className="flex h-5 w-5 items-center justify-center rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {groups.length === 0 ? (
                <p className="px-2 py-6 text-center text-[11px] text-gray-400 dark:text-gray-500">
                  {t('chat.history.empty')}
                </p>
              ) : (
                groups.map((group) => (
                  <div key={group.label} className="mb-2 last:mb-0">
                    <div className="mb-1 px-1 text-[10px] font-semibold tracking-wide text-gray-400 dark:text-gray-500">
                      {t(GROUP_LABEL_KEYS[group.label])}
                    </div>
                    <div className="space-y-0.5">
                      {group.sessions.map((session) => {
                        const isCurrent = session.id === displaySessionId;
                        const isEditing = session.id === editingId;
                        return (
                          <div
                            key={session.id}
                            data-testid="chat-history-row"
                            className={cn(
                              'group flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition-colors',
                              isCurrent
                                ? 'bg-purple-50 dark:bg-purple-900/20'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-800',
                            )}
                          >
                            {isEditing ? (
                              <input
                                data-testid="chat-history-rename-input"
                                value={draft}
                                autoFocus
                                onChange={(event) => setDraft(event.target.value)}
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter') {
                                    event.preventDefault();
                                    commitRename(session.id);
                                  } else if (event.key === 'Escape') {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    setEditingId(null);
                                  }
                                }}
                                onBlur={() => commitRename(session.id)}
                                placeholder={t('chat.history.renamePlaceholder')}
                                className="min-w-0 flex-1 rounded-md border border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-900 px-1.5 py-0.5 text-xs text-gray-800 dark:text-gray-100 outline-none"
                              />
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  onSelect(session.id);
                                  closeOverlay();
                                }}
                                title={new Date(session.createdAt).toLocaleString()}
                                className="min-w-0 flex-1 text-left"
                              >
                                <span className="flex items-center gap-1.5">
                                  <StatusDot status={session.status} />
                                  <span
                                    className={cn(
                                      'truncate text-xs',
                                      isCurrent
                                        ? 'font-semibold text-purple-700 dark:text-purple-300'
                                        : 'text-gray-700 dark:text-gray-200',
                                    )}
                                  >
                                    {session.title}
                                  </span>
                                </span>
                                <span className="mt-0.5 flex items-center gap-1.5 pl-3.5">
                                  <span
                                    className={cn(
                                      'rounded px-1 py-px text-[8px] font-extrabold uppercase tracking-wider',
                                      BADGE_STYLES[session.type],
                                    )}
                                  >
                                    {t(`chat.badge.${session.type}`)}
                                  </span>
                                </span>
                              </button>
                            )}
                            {!isEditing && (
                              <button
                                type="button"
                                data-testid="chat-history-rename"
                                onClick={() => {
                                  setDraft(session.title);
                                  setEditingId(session.id);
                                }}
                                className="hidden shrink-0 text-[10px] text-gray-400 group-hover:block hover:text-gray-700 dark:hover:text-gray-200"
                              >
                                {t('chat.history.rename')}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
