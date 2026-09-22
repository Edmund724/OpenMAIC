'use client';

import { useEffect, useRef, useCallback, useState, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { ChatSession, ChatMessageMetadata } from '@/lib/types/chat';
import type { UIMessage } from 'ai';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/hooks/use-i18n';
import { AvatarDisplay } from '@/components/ui/avatar-display';
import { CircleStop } from 'lucide-react';
import { InlineActionTag } from './inline-action-tag';
import { useUserProfileStore } from '@/lib/store/user-profile';

/** Distance from the bottom that still counts as following the stream. */
const FOLLOW_THRESHOLD_PX = 24;

/** Extended message part type covering standard + custom action parts */
interface MessagePart {
  type: string;
  text?: string;
  _partId?: string;
  actionName?: string;
  state?: string;
}

interface ChatSessionProps {
  readonly session: ChatSession;
  readonly isActive: boolean;
  readonly isStreaming?: boolean;
  readonly activeBubbleId?: string | null;
}

const AVATARS = {
  teacher: '/avatars/teacher.png',
  user: '/avatars/user.png',
};

/**
 * MessageBubble — renders one message as a single chat bubble.
 *
 * Text is already paced by the StreamBuffer (30ms / 1 char) before it reaches
 * React state. No UI-layer animation is needed — we render parts directly.
 * Action badges only appear once the buffer's tick loop reaches them (after
 * all preceding text is fully revealed).
 */
const MessageBubble = memo(function MessageBubble({
  message,
  isUser,
  isTeacher,
  isStreaming,
  isLastMessage,
  isActive,
}: {
  message: UIMessage<ChatMessageMetadata>;
  isUser: boolean;
  isTeacher: boolean;
  isStreaming: boolean;
  isLastMessage: boolean;
  isActive: boolean;
}) {
  const parts: MessagePart[] = (message.parts || []) as MessagePart[];
  const isLive = !!(isStreaming && isLastMessage);

  // ── Determine renderable content ──
  const hasContent = parts.some(
    (p: MessagePart) => (p.type === 'text' && p.text) || p.type?.startsWith('action-'),
  );

  // Loading dots (between agent_start and first text_delta)
  if (!hasContent && isActive && message.role === 'assistant') {
    return (
      <div className="flex gap-1.5 items-center py-1.5 px-1">
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full animate-pulse',
            isTeacher
              ? 'bg-purple-400/70 dark:bg-purple-500/70'
              : 'bg-indigo-400/70 dark:bg-indigo-500/70',
          )}
        />
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full animate-pulse',
            isTeacher
              ? 'bg-purple-400/70 dark:bg-purple-500/70'
              : 'bg-indigo-400/70 dark:bg-indigo-500/70',
          )}
          style={{ animationDelay: '200ms' }}
        />
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full animate-pulse',
            isTeacher
              ? 'bg-purple-400/70 dark:bg-purple-500/70'
              : 'bg-indigo-400/70 dark:bg-indigo-500/70',
          )}
          style={{ animationDelay: '400ms' }}
        />
      </div>
    );
  }

  if (!hasContent) return null;

  const lastTextIdx = parts.reduce(
    (acc: number, p: MessagePart, i: number) => (p.type === 'text' && p.text ? i : acc),
    -1,
  );

  return (
    <div
      className={cn(
        'inline-block px-2.5 py-1.5 rounded-xl text-[12px] leading-relaxed max-w-full text-left transition-shadow duration-300',
        isUser
          ? 'bg-gradient-to-br from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-600 text-white rounded-tr-sm shadow-sm shadow-purple-300/30 dark:shadow-purple-900/50 ring-1 ring-purple-500/20'
          : isTeacher
            ? 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-sm shadow-sm'
            : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-200 border border-indigo-100/50 dark:border-indigo-800/50 rounded-tl-sm',
      )}
    >
      <span className="whitespace-pre-wrap break-words">
        {parts.map((part: MessagePart, i: number) => {
          if (part.type === 'text' || part.type === 'step-start') {
            const text = part.type === 'text' ? part.text : '';
            if (!text) return null;

            const isLast = i === lastTextIdx;

            return (
              <span key={`${message.id}-${i}`}>
                {text}
                {isLive && isLast && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-50 animate-pulse ml-1 align-middle" />
                )}
                {message.metadata?.interrupted && isLast && !isLive && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 ml-1 align-middle" />
                )}
              </span>
            );
          }

          if (part.type?.startsWith('action-')) {
            return (
              <InlineActionTag
                key={`${message.id}-action-${i}`}
                actionName={part.actionName || part.type.replace('action-', '')}
                state={part.state || 'result'}
              />
            );
          }

          return null;
        })}
      </span>
    </div>
  );
});

export function ChatSessionComponent({
  session,
  isActive,
  isStreaming,
  activeBubbleId,
}: ChatSessionProps) {
  const { t } = useI18n();
  const userProfileAvatar = useUserProfileStore((s) => s.avatar);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const activeBubbleRef = useRef<HTMLDivElement>(null);
  const isDiscussion = session.type === 'discussion';
  const isQA = session.type === 'qa';
  const isEnded = session.status === 'completed' && (isDiscussion || isQA);

  // Follow the stream only while the student is at the bottom. Having scrolled
  // up means they are reading, so new text waits behind a pill instead.
  const isAtBottomRef = useRef(true);
  const [hasNewContent, setHasNewContent] = useState(false);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < FOLLOW_THRESHOLD_PX;
    isAtBottomRef.current = atBottom;
    if (atBottom) setHasNewContent(false);
  }, []);

  const scrollToBottom = useCallback(() => {
    const el = scrollContainerRef.current;
    isAtBottomRef.current = true;
    setHasNewContent(false);
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  // Auto-scroll: smooth scroll when a NEW message arrives — but only for a
  // reader who is following along.
  const msgCount = session.messages.length;
  useEffect(() => {
    if (!isAtBottomRef.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- content arrived while the student was reading further up
      setHasNewContent(true);
      return;
    }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [msgCount]);

  // Auto-scroll: rAF-throttled instant scroll as text grows — only when the
  // student is at the bottom; otherwise the growth is news.
  const scrollRaf = useRef(0);
  useEffect(() => {
    if (!isAtBottomRef.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- content arrived while the student was reading further up
      setHasNewContent(true);
      return;
    }
    cancelAnimationFrame(scrollRaf.current);
    scrollRaf.current = requestAnimationFrame(() => {
      const el = scrollContainerRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, [session.messages]);

  // Scroll to active bubble when it changes
  useEffect(() => {
    if (activeBubbleId && activeBubbleRef.current) {
      activeBubbleRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
      isAtBottomRef.current = true;
    }
  }, [activeBubbleId]);

  if (session.messages.length === 0 && !isActive) {
    return (
      <div className="h-20 flex items-center justify-center text-center px-2">
        <p className="text-[10px] text-gray-400 dark:text-gray-500">{t('chat.noMessages')}</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full min-h-0">
      {/* Messages */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        data-testid="chat-transcript"
        className="space-y-1 overflow-y-auto scrollbar-hide"
      >
        {session.messages.map((message, msgIdx) => {
          const isUser = message.metadata?.originalRole === 'user';
          const isTeacher = message.metadata?.originalRole === 'teacher';
          const avatar = isUser
            ? userProfileAvatar || AVATARS.user
            : message.metadata?.senderAvatar || AVATARS.teacher;
          const isActiveBubble = activeBubbleId === message.id;
          const isLastMessage = msgIdx === session.messages.length - 1;

          return (
            <motion.div
              key={message.id}
              ref={isActiveBubble ? activeBubbleRef : undefined}
              initial={{ opacity: 0, y: 4 }}
              animate={
                isActiveBubble
                  ? {
                      opacity: 1,
                      y: 0,
                      boxShadow: [
                        '0 0 0 0 rgba(124, 58, 237, 0)',
                        '0 0 20px 0 rgba(124, 58, 237, 0.15)',
                        '0 0 8px 0 rgba(124, 58, 237, 0.08)',
                      ],
                    }
                  : {
                      opacity: 1,
                      y: 0,
                      boxShadow: '0 0 0 0 rgba(124, 58, 237, 0)',
                    }
              }
              transition={
                isActiveBubble
                  ? {
                      boxShadow: {
                        duration: 2.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      },
                      default: { duration: 0.3 },
                    }
                  : { duration: 0.3 }
              }
              className={cn(
                'flex gap-2 px-1.5 py-1 rounded-lg border-l-[3px] border-l-transparent transition-[background-color,border-color] duration-300',
                isUser && 'flex-row-reverse',
                isActiveBubble &&
                  'border-l-violet-500 dark:border-l-violet-400 bg-violet-50/50 dark:bg-violet-900/20',
              )}
            >
              {/* Mini Avatar */}
              <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 mt-0.5 ring-1 ring-gray-200/50 dark:ring-gray-700/50">
                <AvatarDisplay src={avatar} alt="avatar" className="text-xs" />
              </div>

              {/* Content */}
              <div className={cn('flex-1 min-w-0', isUser && 'text-right')}>
                <span
                  className={cn(
                    'text-[9px] font-bold uppercase tracking-wider block mb-0.5',
                    isUser
                      ? 'text-purple-500 dark:text-purple-400'
                      : isTeacher
                        ? 'text-purple-400 dark:text-purple-300'
                        : 'text-indigo-400 dark:text-indigo-300',
                  )}
                >
                  {(() => {
                    const agentId = message.metadata?.agentId;
                    if (agentId) {
                      const i18nName = t(`settings.agentNames.${agentId}`);
                      if (i18nName !== `settings.agentNames.${agentId}`) return i18nName;
                    }
                    return message.metadata?.senderName || t('chat.unknown');
                  })()}
                </span>

                <MessageBubble
                  message={message}
                  isUser={isUser}
                  isTeacher={isTeacher}
                  isStreaming={!!isStreaming}
                  isLastMessage={isLastMessage}
                  isActive={isActive}
                />
              </div>
            </motion.div>
          );
        })}

        {/* Session ended indicator */}
        <AnimatePresence>
          {isEnded && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mx-3 mt-2 mb-1 flex items-center gap-2"
            >
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
              <span className="flex items-center gap-1 text-[9px] text-gray-400 dark:text-gray-500 font-medium">
                <CircleStop className="w-2.5 h-2.5" />
                {t('chat.ended')}
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* New text arrived while the student was reading further up. */}
      {hasNewContent && (
        <button
          type="button"
          data-testid="chat-new-content"
          onClick={scrollToBottom}
          className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-gray-800/90 dark:bg-gray-600/90 px-3 py-1 text-[11px] font-medium text-white shadow-lg backdrop-blur transition-colors hover:bg-gray-900 dark:hover:bg-gray-500"
        >
          {t('chat.stream.newContent')}
        </button>
      )}
    </div>
  );
}
