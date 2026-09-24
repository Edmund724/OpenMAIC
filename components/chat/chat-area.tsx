'use client';

import {
  useImperativeHandle,
  forwardRef,
  useRef,
  useCallback,
  useState,
  useMemo,
  useEffect,
  type ReactNode,
} from 'react';
import type { SessionType } from '@/lib/types/chat';
import type { DiscussionRequest } from '@/components/roundtable';
import type { Action } from '@/lib/types/action';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/hooks/use-i18n';
import { useStageStore } from '@/lib/store';
import { buildLectureNotes } from '@/lib/chat/lecture-notes';
import {
  PanelRightClose,
  BookOpen,
  MessageSquare,
  History,
  Circle,
  ListRestart,
  Play,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  useChatSessions,
  isOpenLiveSession,
  MANUAL_STOP_END_OPTIONS,
  type EndSessionOptions,
  type SessionCleanupPayload,
  type ChatMessageSendOptions,
} from './use-chat-sessions';
import { ChatSessionComponent } from './chat-session';
import { HistoryOverlay } from './history-overlay';
import { Composer, type ComposerHandle } from './composer';
import { useSoftCloseCountdown } from './use-soft-close-countdown';
import { LectureNotesView } from './lecture-notes-view';

interface ChatAreaProps {
  className?: string;
  width?: number;
  onWidthChange?: (width: number) => void;
  collapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
  activeBubbleId?: string | null;
  onActiveBubble?: (messageId: string | null) => void;
  onLiveSpeech?: (text: string | null, agentId?: string | null) => void;
  onSpeechProgress?: (ratio: number | null) => void;
  onThinking?: (state: { stage: string; agentId?: string } | null) => void;
  onCueUser?: (fromAgentId?: string, prompt?: string) => void;
  onLiveSessionError?: () => void;
  onSoftCloseSession?: (payload: SessionCleanupPayload) => void;
  onSoftClosingChange?: (softClosing: boolean, deadline?: number) => void;
  onStopSession?: (payload: SessionCleanupPayload) => void;
  onSegmentSealed?: (
    messageId: string,
    partId: string,
    fullText: string,
    agentId: string | null,
  ) => void;
  /** When provided and returns true, StreamBuffer holds on the current text item after reveal. */
  shouldHoldAfterReveal?: () => { holding: boolean; segmentDone: number } | boolean;
  currentSceneId?: string | null;
  currentActionIndex?: number | null;
  canJumpToAction?: (sceneId: string, actionIndex: number) => boolean;
  onJumpToAction?: (sceneId: string, actionIndex: number) => void;
  /** The student's text, handed to the engine by the owner of `onMessageSend`. */
  onComposerSubmit?: (text: string) => void;
  /** Veto for a send the engine side must refuse (stale element reference). */
  canComposerSubmit?: () => boolean;
  /** Focus or first keystroke in the composer → level-1 pause. */
  onComposerInputActivate?: () => void;
  /** Typing or starting a recording → keep a soft-closing session alive. */
  onComposerUserInputActivity?: () => void;
  /** The composer is recording or transcribing. */
  onComposerActivity?: (active: boolean) => void;
  /** It is the student's turn. */
  isCueUser?: boolean;
  /** The courseware-reference receipt, shown above the composer. */
  elementReferencePill?: ReactNode;
}

export interface ChatAreaRef {
  createSession: (type: SessionType, title: string) => Promise<string>;
  endSession: (sessionId: string, options?: EndSessionOptions) => Promise<void>;
  endActiveSession: (options?: EndSessionOptions) => Promise<void>;
  stopActiveSession: () => Promise<void>;
  continueActiveSoftClosingSession: () => boolean;
  softPauseActiveSession: () => Promise<void>;
  resumeActiveSession: () => Promise<void>;
  sendMessage: (content: string, options?: ChatMessageSendOptions) => Promise<void>;
  startDiscussion: (request: DiscussionRequest) => Promise<void>;
  startLecture: (sceneId: string) => Promise<string>;
  addLectureMessage: (sessionId: string, action: Action, actionIndex: number) => void;
  getIsStreaming: () => boolean;
  getActiveSessionType: () => string | null;
  getLectureMessageId: (sessionId: string) => string | null;
  pauseBuffer: (sessionId: string) => void;
  resumeBuffer: (sessionId: string) => void;
  pauseActiveLiveBuffer: () => boolean;
  resumeActiveLiveBuffer: () => void;
  switchToTab: (tab: 'lecture' | 'chat') => void;
  /** Panel-composer controls for the global T / V / Escape shortcuts. */
  requestComposer: (action: 'focus' | 'blur' | 'toggle-voice' | 'stop-voice') => void;
  composerState: () => { focused: boolean; recording: boolean };
}

const DEFAULT_WIDTH = 340;
const MIN_WIDTH = 240;
const MAX_WIDTH = 560;

const STATUS_ACTION_CLASS =
  'flex h-5 shrink-0 items-center gap-1 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700';

export type ChatStatusState = 'none' | 'active' | 'soft-closing' | 'other';

/**
 * The thin band between the transcript and the composer: what the engine is
 * doing, and the one thing the student can do about it.
 */
export function ChatStatusBar({
  state,
  softCloseDeadline,
  onStop,
  onContinue,
  onBack,
}: {
  readonly state: ChatStatusState;
  readonly softCloseDeadline?: number;
  readonly onStop?: () => void;
  readonly onContinue?: () => void;
  readonly onBack?: () => void;
}) {
  const { t } = useI18n();
  const remaining = useSoftCloseCountdown(softCloseDeadline);
  if (state === 'none') return null;

  return (
    <div
      data-testid="chat-status-bar"
      data-state={state}
      className="mb-1.5 flex items-center gap-2 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50 px-2 py-1"
    >
      {state === 'active' && (
        <>
          <Circle className="h-2.5 w-2.5 shrink-0 animate-pulse fill-purple-500 text-purple-500" />
          <span className="min-w-0 flex-1 truncate text-[10px] text-gray-500 dark:text-gray-400">
            {t('chat.status.answering')}
          </span>
          <button type="button" onClick={onStop} className={STATUS_ACTION_CLASS}>
            {t('chat.status.stop')}
          </button>
        </>
      )}

      {state === 'soft-closing' && (
        <>
          <MessageSquare className="h-3 w-3 shrink-0 text-amber-500" />
          <span className="min-w-0 flex-1 truncate text-[10px] text-gray-500 dark:text-gray-400">
            {t('chat.status.softClosing', { seconds: remaining ?? 0 })}
          </span>
          <button type="button" onClick={onContinue} className={STATUS_ACTION_CLASS}>
            <Play className="h-2.5 w-2.5 fill-current" />
            {t('chat.softClosing')}
          </button>
        </>
      )}

      {state === 'other' && (
        <>
          <ListRestart className="h-3 w-3 shrink-0 text-purple-500" />
          <span className="min-w-0 flex-1 truncate text-[10px] text-gray-500 dark:text-gray-400">
            {t('chat.status.otherRunning')}
          </span>
          <button type="button" onClick={onBack} className={STATUS_ACTION_CLASS}>
            {t('chat.status.back')}
          </button>
        </>
      )}
    </div>
  );
}

export const ChatArea = forwardRef<ChatAreaRef, ChatAreaProps>(
  (
    {
      className,
      width = DEFAULT_WIDTH,
      onWidthChange,
      collapsed = false,
      onCollapseChange,
      activeBubbleId,
      onActiveBubble,
      onLiveSpeech,
      onSpeechProgress,
      onThinking,
      onCueUser,
      onLiveSessionError,
      onSoftCloseSession,
      onSoftClosingChange,
      onStopSession,
      onSegmentSealed,
      shouldHoldAfterReveal,
      currentSceneId,
      currentActionIndex,
      canJumpToAction,
      onJumpToAction,
      onComposerSubmit,
      canComposerSubmit,
      onComposerInputActivate,
      onComposerUserInputActivity,
      onComposerActivity,
      isCueUser,
      elementReferencePill,
    },
    ref,
  ) => {
    const { t } = useI18n();
    const scenes = useStageStore((s) => s.scenes);
    const {
      sessions,
      activeSessionId,
      activeSessionType,
      displaySessionId,
      setDisplaySessionId,
      unreadSessionIds,
      renameSession,
      composerDrafts,
      isStreaming,
      createSession,
      endSession,
      endActiveSession,
      continueSoftClosingSession,
      confirmSoftClosingSession,
      softPauseActiveSession,
      resumeActiveSession,
      sendMessage,
      startDiscussion,
      startLecture,
      addLectureMessage,
      getLectureMessageId,
      pauseBuffer,
      resumeBuffer,
      pauseActiveLiveBuffer,
      resumeActiveLiveBuffer,
    } = useChatSessions({
      onLiveSpeech,
      onSpeechProgress,
      onThinking,
      onCueUser,
      onActiveBubble,
      onLiveSessionError,
      onSoftCloseSession,
      onStopSession,
      onSegmentSealed,
      shouldHoldAfterReveal,
    });

    const [activeTab, setActiveTab] = useState<'lecture' | 'chat'>('lecture');
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    // Fixed when the list opens, so a session cannot change groups mid-read.
    const [historyOpenedAt, setHistoryOpenedAt] = useState(0);
    const isDraggingRef = useRef(false);
    const [isDragging, setIsDragging] = useState(false);
    const composerRef = useRef<ComposerHandle>(null);
    // Focus or voice may be asked for while the chat tab is not mounted yet.
    const pendingComposerActionRef = useRef<'focus' | 'toggle-voice' | null>(null);

    /**
     * Radix mounts the chat pane a tick after the tab flips, so a focus asked
     * for on the way in has no handle to call yet — it waits for this rather
     * than being dropped.
     */
    const attachComposer = useCallback((handle: ComposerHandle | null) => {
      composerRef.current = handle;
      if (!handle) return;
      const action = pendingComposerActionRef.current;
      if (!action) return;
      pendingComposerActionRef.current = null;
      if (action === 'focus') handle.focus();
      else handle.startVoice();
    }, []);

    // Derive lecture notes directly from scenes — updates reactively as scenes stream in.
    const lectureNotes = useMemo(() => buildLectureNotes(scenes), [scenes]);

    // Filter out lecture sessions for the Chat tab
    const chatSessions = useMemo(() => sessions.filter((s) => s.type !== 'lecture'), [sessions]);

    // A lecture write is never a conversation the student can open from this tab, so it must not
    // light a dot the tab itself cannot clear.
    const hasUnreadChat = useMemo(
      () => chatSessions.some((session) => unreadSessionIds.has(session.id)),
      [chatSessions, unreadSessionIds],
    );

    const displaySession = useMemo(
      () => chatSessions.find((s) => s.id === displaySessionId) ?? null,
      [chatSessions, displaySessionId],
    );

    const openLiveSession = useMemo(() => chatSessions.find(isOpenLiveSession) ?? null, [
      chatSessions,
    ]);

    const softClosingChatSession = useMemo(
      () => chatSessions.find((s) => s.status === 'soft-closing'),
      [chatSessions],
    );

    const statusState: ChatStatusState = !openLiveSession
      ? 'none'
      : openLiveSession.id !== displaySessionId
        ? 'other'
        : openLiveSession.status === 'soft-closing'
          ? 'soft-closing'
          : 'active';

    useEffect(() => {
      onSoftClosingChange?.(
        Boolean(softClosingChatSession),
        softClosingChatSession?.softCloseDeadline,
      );
    }, [softClosingChatSession, onSoftClosingChange]);

    // Wrap endSession for QA/Discussion: also notify parent for engine cleanup
    const handleEndSession = useCallback(
      async (sessionId: string) => {
        const session = chatSessions.find((candidate) => candidate.id === sessionId);
        if (session?.status === 'soft-closing') {
          const payload = await confirmSoftClosingSession(sessionId);
          if (payload) onStopSession?.(payload);
          return;
        }
        await endSession(sessionId, MANUAL_STOP_END_OPTIONS);
        onStopSession?.({ sessionId, source: 'manual_stop' });
      },
      [chatSessions, confirmSoftClosingSession, endSession, onStopSession],
    );

    const handleStopActiveSession = useCallback(async () => {
      const active = chatSessions.find(
        (session) => session.status === 'active' || session.status === 'soft-closing',
      );
      if (active) await handleEndSession(active.id);
    }, [chatSessions, handleEndSession]);

    const handleContinueActiveSoftClosingSession = useCallback((): boolean => {
      const softClosing = chatSessions.find((session) => session.status === 'soft-closing');
      return softClosing ? continueSoftClosingSession(softClosing.id) : false;
    }, [chatSessions, continueSoftClosingSession]);

    const switchToTab = useCallback((tab: 'lecture' | 'chat') => {
      setActiveTab(tab);
    }, []);

    const requestComposer = useCallback((action: 'focus' | 'blur' | 'toggle-voice' | 'stop-voice') => {
      setActiveTab('chat');
      if (action === 'stop-voice') {
        composerRef.current?.stopVoice();
        return;
      }
      if (action === 'blur') {
        composerRef.current?.blur();
        return;
      }
      const handle = composerRef.current;
      if (action === 'focus' && handle) {
        handle.focus();
        return;
      }
      if (action === 'toggle-voice' && handle) {
        if (handle.isRecording()) handle.stopVoice();
        else handle.startVoice();
        return;
      }
      pendingComposerActionRef.current = action;
    }, []);

    const draftKey = displaySessionId ?? '';

    useImperativeHandle(ref, () => ({
      createSession,
      endSession,
      endActiveSession,
      stopActiveSession: handleStopActiveSession,
      continueActiveSoftClosingSession: handleContinueActiveSoftClosingSession,
      softPauseActiveSession,
      resumeActiveSession,
      sendMessage,
      startDiscussion,
      startLecture,
      addLectureMessage,
      getIsStreaming: () => isStreaming,
      getActiveSessionType: () => activeSessionType,
      getLectureMessageId,
      pauseBuffer,
      resumeBuffer,
      pauseActiveLiveBuffer,
      resumeActiveLiveBuffer,
      switchToTab,
      requestComposer,
      composerState: () => ({
        focused: composerRef.current?.hasFocus() ?? false,
        recording: composerRef.current?.isRecording() ?? false,
      }),
    }));

    // Drag-to-resize
    const handleDragStart = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        isDraggingRef.current = true;
        setIsDragging(true);
        const startX = e.clientX;
        const startWidth = width;

        const handleMouseMove = (me: MouseEvent) => {
          const delta = startX - me.clientX;
          const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + delta));
          onWidthChange?.(newWidth);
        };

        const handleMouseUp = () => {
          isDraggingRef.current = false;
          setIsDragging(false);
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
        };

        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      },
      [width, onWidthChange],
    );

    const displayWidth = collapsed ? 0 : width;

    return (
      <div
        style={{
          width: displayWidth,
          transition: isDragging ? 'none' : 'width 0.3s ease',
        }}
        className={cn(
          'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-l border-gray-100 dark:border-gray-800 shadow-[-2px_0_24px_rgba(0,0,0,0.02)] flex flex-col shrink-0 z-20 relative overflow-visible',
          className,
        )}
      >
        {/* Drag handle */}
        {!collapsed && (
          <div
            onMouseDown={handleDragStart}
            className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize z-50 group hover:bg-purple-400/30 dark:hover:bg-purple-600/30 active:bg-purple-500/40 dark:active:bg-purple-500/40 transition-colors"
          >
            <div className="absolute left-0.5 top-1/2 -translate-y-1/2 w-0.5 h-8 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-purple-400 dark:group-hover:bg-purple-500 transition-colors" />
          </div>
        )}

        <div className={cn('flex flex-col w-full h-full overflow-hidden', collapsed && 'hidden')}>
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as 'lecture' | 'chat')}
            className="flex flex-col h-full gap-0"
          >
            {/* Tab header row */}
            <div className="h-10 flex items-center gap-1 shrink-0 mt-3 mb-1 px-3">
              <button
                type="button"
                data-testid="chat-history-open"
                aria-label={t('chat.history.open')}
                title={t('chat.history.open')}
                aria-expanded={isHistoryOpen}
                onClick={() => {
                  setHistoryOpenedAt(Date.now());
                  setIsHistoryOpen((open) => !open);
                }}
                className="w-7 h-7 shrink-0 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <History className="w-4 h-4" />
              </button>
              <TabsList variant="line" className="h-full flex-1 w-0">
                <TabsTrigger value="lecture" className="text-xs gap-1 flex-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  {t('chat.tabs.lecture')}
                </TabsTrigger>
                <TabsTrigger value="chat" className="text-xs gap-1 flex-1 relative">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {t('chat.tabs.chat')}
                  {/* Amber pulse dot: unread engine replies, or the student's turn */}
                  {(hasUnreadChat || isCueUser) && activeTab === 'lecture' && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              {onCollapseChange && (
                <button
                  onClick={() => onCollapseChange(true)}
                  className="w-7 h-7 shrink-0 rounded-lg flex items-center justify-center bg-gray-100/80 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 ring-1 ring-black/[0.04] dark:ring-white/[0.06] hover:bg-gray-200/90 dark:hover:bg-gray-700/90 hover:text-gray-700 dark:hover:text-gray-200 active:scale-90 transition-all duration-200"
                >
                  <PanelRightClose className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Notes Tab */}
            <TabsContent value="lecture" className="flex-1 overflow-hidden flex flex-col">
              <LectureNotesView
                notes={lectureNotes}
                currentSceneId={currentSceneId}
                currentActionIndex={currentActionIndex}
                canJumpToAction={canJumpToAction}
                onJumpToAction={onJumpToAction}
              />
            </TabsContent>

            {/* Chat Tab — one conversation, always: transcript, status, composer */}
            <TabsContent value="chat" className="flex-1 overflow-hidden flex flex-col">
              <div className="flex-1 min-h-0 overflow-hidden">
                {displaySession ? (
                  <div className="h-full">
                    <ChatSessionComponent
                      session={displaySession}
                      isActive={
                        displaySession.status === 'active' ||
                        displaySession.status === 'soft-closing'
                      }
                      isStreaming={
                        isStreaming &&
                        displaySession.id === activeSessionId &&
                        (displaySession.status === 'active' ||
                          displaySession.status === 'soft-closing')
                      }
                      activeBubbleId={activeBubbleId}
                    />
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-3 text-purple-400 dark:text-purple-300">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {t('chat.startConversation')}
                    </p>
                  </div>
                )}
              </div>

              <div className="shrink-0 border-t border-gray-100 dark:border-gray-800 p-2">
                <ChatStatusBar
                  state={statusState}
                  softCloseDeadline={openLiveSession?.softCloseDeadline}
                  onStop={
                    openLiveSession ? () => void handleEndSession(openLiveSession.id) : undefined
                  }
                  onContinue={
                    openLiveSession
                      ? () => continueSoftClosingSession(openLiveSession.id)
                      : undefined
                  }
                  onBack={openLiveSession ? () => setDisplaySessionId(openLiveSession.id) : undefined}
                />
                <Composer
                  ref={attachComposer}
                  variant="panel"
                  value={composerDrafts.get(draftKey)}
                  onValueChange={(next) => composerDrafts.set(draftKey, next)}
                  onSubmit={(text) => {
                    if (!onComposerSubmit) return;
                    composerDrafts.set(draftKey, '');
                    onComposerSubmit(text);
                  }}
                  onInputActivate={onComposerInputActivate}
                  onUserInputActivity={onComposerUserInputActivity}
                  onActivityChange={onComposerActivity}
                  isCueUser={isCueUser}
                  disabled={isStreaming}
                  canSubmit={canComposerSubmit}
                  elementReferencePill={elementReferencePill}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <HistoryOverlay
          open={isHistoryOpen}
          sessions={chatSessions}
          displaySessionId={displaySessionId}
          openedAt={historyOpenedAt}
          onSelect={setDisplaySessionId}
          onNew={() => setDisplaySessionId(null)}
          onRename={renameSession}
          onClose={() => setIsHistoryOpen(false)}
        />
      </div>
    );
  },
);

ChatArea.displayName = 'ChatArea';
