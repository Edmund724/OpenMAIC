'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Pause,
  Play,
  ChevronLeft,
  ChevronRight,
  Repeat,
  BookOpen,
  Loader2,
  Volume2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AudioIndicatorState } from './audio-indicator';
import { CanvasToolbar } from '@/components/canvas/canvas-toolbar';
import { useI18n } from '@/lib/hooks/use-i18n';
import { useSettingsStore, PLAYBACK_SPEEDS } from '@/lib/store/settings';
import { ProactiveCard } from '@/components/chat/proactive-card';
import { PresentationSpeechOverlay } from '@/components/roundtable/presentation-speech-overlay';
import { AvatarDisplay } from '@/components/ui/avatar-display';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { useAgentRegistry } from '@/lib/orchestration/registry/store';
import { DEFAULT_TEACHER_AVATAR, DEFAULT_USER_AVATAR } from '@/components/roundtable/constants';
import type { DiscussionAction } from '@/lib/types/action';
import type { EngineMode, PlaybackView } from '@/lib/playback';
import type { Participant } from '@/lib/types/roundtable';

/**
 * The column reserved beside the slide while presenting, for the input bar.
 * Shared with the playback chrome, which renders the column: the stage keeps
 * its own fixed offsets out of the same number.
 */
export const PRESENTATION_COMPOSER_COLUMN_PX = 268;

export interface DiscussionRequest {
  topic: string;
  prompt?: string;
  agentId?: string; // Agent ID to initiate discussion (default: 'default-1')
}

interface RoundtableProps {
  readonly mode?: 'playback' | 'autonomous';
  readonly initialParticipants?: Participant[];
  readonly playbackView?: PlaybackView; // Centralised derived state from Stage
  readonly currentSpeech?: string | null; // Live SSE speech (from StreamBuffer — discussion/QA)
  readonly lectureSpeech?: string | null; // Active lecture speech (from PlaybackEngine, full text)
  readonly idleText?: string | null; // Static idle text (first speech action)
  readonly playbackCompleted?: boolean; // True when engine finished all actions (show restart icon)
  readonly discussionRequest?: DiscussionAction | null;
  readonly engineMode?: EngineMode;
  readonly isStreaming?: boolean;
  readonly sessionType?: 'qa' | 'discussion';
  readonly speakingAgentId?: string | null;
  readonly audioIndicatorState?: AudioIndicatorState;
  readonly audioAgentId?: string | null;
  readonly speechProgress?: number | null; // StreamBuffer reveal progress (0–1) for auto-scroll
  readonly showEndFlash?: boolean;
  readonly endFlashSessionType?: 'qa' | 'discussion';
  readonly thinkingState?: { stage: string; agentId?: string } | null;
  /** It is the student's turn: the stage holds its teacher bubble back. */
  readonly isCueUser?: boolean;
  /** The student's last utterance, echoed on the stage for three seconds. */
  readonly studentUtterance?: { text: string; seq: number } | null;
  /** Session entered the soft-closing grace window (client-side, ~15s). */
  readonly isSoftClosing?: boolean;
  readonly softCloseDeadline?: number;
  readonly isTopicPending?: boolean;
  readonly onDiscussionStart?: (request: DiscussionAction) => void;
  readonly onDiscussionSkip?: () => void;
  readonly onStopDiscussion?: () => void;
  readonly onContinueDiscussion?: () => void;

  readonly onResumeTopic?: () => void;
  readonly onPlayPause?: () => void;
  readonly isDiscussionPaused?: boolean;
  readonly onDiscussionPause?: () => void;
  readonly onDiscussionResume?: () => void;
  readonly totalActions?: number;
  readonly currentActionIndex?: number;
  // Toolbar props (merged from CanvasArea)
  readonly currentSceneIndex?: number;
  readonly scenesCount?: number;
  readonly whiteboardOpen?: boolean;
  readonly sidebarCollapsed?: boolean;
  readonly chatCollapsed?: boolean;
  readonly onToggleSidebar?: () => void;
  readonly onToggleChat?: () => void;
  readonly onPrevSlide?: () => void;
  readonly onNextSlide?: () => void;
  readonly onWhiteboardClose?: () => void;
  readonly isPresenting?: boolean;
  readonly controlsVisible?: boolean;
  readonly onTogglePresentation?: () => void;
  /** Ref to the fullscreen container — passed to ProactiveCard so its portal
   *  renders inside the top-layer during presentation mode. */
  readonly fullscreenContainerRef?: React.RefObject<HTMLDivElement | null>;
  readonly showElementReference?: boolean;
  readonly canPickSlideElement?: boolean;
  readonly elementPickActive?: boolean;
  readonly onToggleElementPick?: () => void;
}

export function Roundtable({
  mode: _mode = 'autonomous',
  initialParticipants = [],
  playbackView,
  currentSpeech,
  lectureSpeech,
  idleText,
  playbackCompleted,
  discussionRequest,
  engineMode = 'idle',
  isStreaming,
  sessionType,
  speakingAgentId,
  audioIndicatorState,
  audioAgentId,
  speechProgress: _speechProgress,
  showEndFlash,
  endFlashSessionType = 'discussion',
  thinkingState,
  isCueUser,
  studentUtterance,
  isSoftClosing,
  softCloseDeadline,
  isTopicPending,
  onDiscussionStart,
  onDiscussionSkip,
  onStopDiscussion,
  onContinueDiscussion,

  onResumeTopic,
  onPlayPause,
  isDiscussionPaused,
  onDiscussionPause,
  onDiscussionResume,
  currentSceneIndex = 0,
  scenesCount = 1,
  whiteboardOpen = false,
  sidebarCollapsed,
  chatCollapsed,
  onToggleSidebar,
  onToggleChat,
  onPrevSlide,
  onNextSlide,
  onWhiteboardClose,
  isPresenting,
  controlsVisible,
  onTogglePresentation,
  fullscreenContainerRef,
  showElementReference,
  canPickSlideElement,
  elementPickActive,
  onToggleElementPick,
}: RoundtableProps) {
  const { t } = useI18n();
  const ttsMuted = useSettingsStore((s) => s.ttsMuted);
  const setTTSMuted = useSettingsStore((s) => s.setTTSMuted);
  const ttsEnabled = useSettingsStore((state) => state.ttsEnabled);
  const chatAreaWidth = useSettingsStore((s) => s.chatAreaWidth);
  const ttsVolume = useSettingsStore((s) => s.ttsVolume);
  const setTTSVolume = useSettingsStore((s) => s.setTTSVolume);
  const autoPlayLecture = useSettingsStore((s) => s.autoPlayLecture);
  const setAutoPlayLecture = useSettingsStore((s) => s.setAutoPlayLecture);
  const playbackSpeed = useSettingsStore((s) => s.playbackSpeed);
  const setPlaybackSpeed = useSettingsStore((s) => s.setPlaybackSpeed);
  const [userMessage, setUserMessage] = useState<string | null>(null);
  const agentScrollRef = useRef<HTMLDivElement>(null);
  const bubbleScrollRef = useRef<HTMLDivElement>(null);
  const teacherAvatarRef = useRef<HTMLDivElement>(null);
  const studentAvatarRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const userMessageClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // End flash visible state (Issue 3)
  const [endFlashVisible, setEndFlashVisible] = useState(false);

  const teacherParticipant = initialParticipants.find((p) => p.role === 'teacher');
  const studentParticipants = initialParticipants.filter(
    (p) => p.role !== 'teacher' && p.role !== 'user',
  );

  // Stable ref object for the current discussion agent's avatar
  const discussionAnchorRef = useRef<HTMLDivElement>(null);
  const presentationActionAnchorRef = useRef<HTMLDivElement>(null);
  const presentationAgentAvatarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!discussionRequest) {
      discussionAnchorRef.current = null;
      return;
    }
    if (discussionRequest.agentId === teacherParticipant?.id) {
      discussionAnchorRef.current = teacherAvatarRef.current;
    } else {
      discussionAnchorRef.current =
        studentAvatarRefs.current.get(discussionRequest.agentId || '') || null;
    }
  }, [discussionRequest, teacherParticipant?.id]);

  // Derived state from Stage's computePlaybackView (centralised derivation)
  const isInLiveFlow =
    playbackView?.isInLiveFlow ??
    !!(speakingAgentId || thinkingState || isStreaming || sessionType);

  // Role-aware source text: userMessage overlay on top of playbackView
  const sourceText = userMessage
    ? userMessage
    : (playbackView?.sourceText ??
      (currentSpeech
        ? currentSpeech
        : isInLiveFlow
          ? ''
          : lectureSpeech || (playbackCompleted ? '' : idleText) || ''));
  const hasAgentFeedback = Boolean(playbackView?.sourceText || thinkingState);
  const prevHasAgentFeedbackRef = useRef(hasAgentFeedback);

  const clearUserMessageClearTimer = useCallback(() => {
    if (userMessageClearTimerRef.current) {
      clearTimeout(userMessageClearTimerRef.current);
      userMessageClearTimerRef.current = null;
    }
  }, []);

  const scheduleUserMessageClear = useCallback(() => {
    clearUserMessageClearTimer();
    userMessageClearTimerRef.current = setTimeout(() => {
      setUserMessage(null);
      userMessageClearTimerRef.current = null;
    }, 3000);
  }, [clearUserMessageClearTimer]);

  const showLocalUserMessage = useCallback(
    (text: string) => {
      setUserMessage(text);
      // Mark as "already seen feedback" so that the immediate thinkingState
      // transition (false→true) after user sends won't trigger the early-clear
      // effect and swallow the user bubble.
      prevHasAgentFeedbackRef.current = true;
      scheduleUserMessageClear();
    },
    [scheduleUserMessageClear],
  );

  // Auto-scroll bubble: keep latest streaming text visible during live/discussion flow
  useEffect(() => {
    if (!isInLiveFlow) return;
    const el = bubbleScrollRef.current;
    if (!el) return;
    const scrollableHeight = el.scrollHeight - el.clientHeight;
    if (scrollableHeight <= 0) return;
    el.scrollTo({ top: scrollableHeight, behavior: 'smooth' });
  }, [sourceText, isInLiveFlow]);

  // Clear user message early when agent starts responding
  useEffect(() => {
    const feedbackStarted = hasAgentFeedback && !prevHasAgentFeedbackRef.current;
    if (userMessage && feedbackStarted) {
      clearUserMessageClearTimer();
      setUserMessage(null);
    }
    prevHasAgentFeedbackRef.current = hasAgentFeedback;
  }, [clearUserMessageClearTimer, hasAgentFeedback, userMessage]);

  useEffect(() => () => clearUserMessageClearTimer(), [clearUserMessageClearTimer]);

  // End flash effect (Issue 3)
  useEffect(() => {
    if (showEndFlash) {
      setEndFlashVisible(true);
      const timer = setTimeout(() => setEndFlashVisible(false), 1800);
      return () => clearTimeout(timer);
    } else {
      setEndFlashVisible(false);
    }
  }, [showEndFlash]);

  // Separate participants by role (teacherParticipant & studentParticipants declared earlier for effect)
  const userParticipant = initialParticipants.find((p) => p.role === 'user');

  const teacherAvatar = teacherParticipant?.avatar || DEFAULT_TEACHER_AVATAR;
  const teacherName = teacherParticipant?.name || t('roundtable.teacher');
  const userAvatar = userParticipant?.avatar || DEFAULT_USER_AVATAR;

  // The student's utterance is echoed on the stage for three seconds. The
  // composer owns the text; the stage only shows that it was said.
  const utteranceSeqRef = useRef(0);
  useEffect(() => {
    if (!studentUtterance || studentUtterance.seq === utteranceSeqRef.current) return;
    utteranceSeqRef.current = studentUtterance.seq;
    showLocalUserMessage(studentUtterance.text);
  }, [showLocalUserMessage, studentUtterance]);

  // Determine active speaking state and bubble ownership
  // Check if current speaker is a student agent (not teacher)
  const speakingStudent = speakingAgentId
    ? studentParticipants.find((s) => s.id === speakingAgentId)
    : null;

  // Bubble loading: speakingAgentId is set (agent_start fired) but text hasn't arrived yet
  const isBubbleLoading = !!(speakingAgentId && !currentSpeech && !userMessage);
  // Student agent specifically loading (for agent-style bubble)
  const isAgentLoading = !!(speakingStudent && !currentSpeech && !userMessage);

  const activeRole: 'teacher' | 'user' | 'agent' | null = userMessage
    ? 'user'
    : (playbackView?.activeRole ??
      (currentSpeech && speakingStudent
        ? 'agent'
        : currentSpeech
          ? 'teacher'
          : isAgentLoading
            ? 'agent'
            : isBubbleLoading
              ? 'teacher'
              : isCueUser
                ? null
                : lectureSpeech
                  ? 'teacher'
                  : null));

  const bubbleRole: 'teacher' | 'user' | 'agent' | null = userMessage
    ? 'user'
    : (playbackView?.bubbleRole ??
      (currentSpeech && speakingStudent
        ? 'agent'
        : currentSpeech
          ? 'teacher'
          : isAgentLoading
            ? 'agent'
            : isBubbleLoading
              ? 'teacher'
              : isInLiveFlow
                ? null
                : isCueUser
                  ? null
                  : lectureSpeech || idleText
                    ? 'teacher'
                    : null));

  const bubbleName =
    bubbleRole === 'agent'
      ? speakingStudent?.name || t('settings.agentRoles.student')
      : bubbleRole === 'teacher'
        ? teacherName
        : bubbleRole === 'user'
          ? t('roundtable.you')
          : '';

  // Stable key based on speaker identity, NOT text content (prevents re-mount flicker)
  const bubbleKey =
    bubbleRole === 'user'
      ? 'user'
      : bubbleRole === 'agent'
        ? `agent-${speakingAgentId}`
        : bubbleRole === 'teacher'
          ? 'teacher'
          : 'idle';

  // Enriched playbackView that includes userMessage overlay for bubbleRole/sourceText
  const enrichedPlaybackView: PlaybackView = playbackView
    ? { ...playbackView, bubbleRole, sourceText, activeRole: activeRole ?? playbackView.activeRole }
    : {
        phase: 'idle' as const,
        sourceText,
        bubbleRole,
        activeRole,
        buttonState: 'none' as const,
        isInLiveFlow: false,
        isTopicActive: false,
      };

  // Show stop button whenever there's an active QA/discussion session or live mode.
  // sessionType is only cleared in doSessionCleanup, so this stays stable through
  // brief loading gaps (e.g. between user message and agent SSE response).
  const showStopButton =
    engineMode === 'live' || sessionType === 'qa' || sessionType === 'discussion';

  const handleCycleSpeed = useCallback(() => {
    const currentIndex = PLAYBACK_SPEEDS.indexOf(playbackSpeed as (typeof PLAYBACK_SPEEDS)[number]);
    const nextIndex = (currentIndex + 1) % PLAYBACK_SPEEDS.length;
    setPlaybackSpeed(PLAYBACK_SPEEDS[nextIndex]);
  }, [playbackSpeed, setPlaybackSpeed]);

  // Intentionally non-reactive: agent metadata is treated as immutable during a classroom session.
  const agentRegistry = useAgentRegistry.getState();
  const getAgentConfig = (id: string) => agentRegistry.getAgent(id);

  const presentationDiscussionParticipant = discussionRequest
    ? discussionRequest.agentId === teacherParticipant?.id
      ? teacherParticipant || null
      : studentParticipants.find((student) => student.id === discussionRequest.agentId) || null
    : null;
  const presentationDiscussionAgentConfig = discussionRequest
    ? getAgentConfig(discussionRequest.agentId || '')
    : null;

  const handlePresentationBubbleClick = useCallback(() => {
    if (isTopicPending) {
      onResumeTopic?.();
      return;
    }
    if (isInLiveFlow) {
      if (isDiscussionPaused) {
        onDiscussionResume?.();
      } else if (!thinkingState && currentSpeech) {
        onDiscussionPause?.();
      }
      return;
    }
    onPlayPause?.();
  }, [
    isTopicPending,
    isInLiveFlow,
    isDiscussionPaused,
    thinkingState,
    currentSpeech,
    onResumeTopic,
    onDiscussionResume,
    onDiscussionPause,
    onPlayPause,
  ]);
  // How much of the right edge the stage's fixed overlays must keep clear: the
  // expanded chat panel, or the composer column reserved while presenting.
  const sidePanelInset = isPresenting
    ? PRESENTATION_COMPOSER_COLUMN_PX
    : chatCollapsed === false
      ? (chatAreaWidth ?? 320)
      : 0;

  // The dock only exists while it has something in it: the agent asking for a
  // discussion or talking. The student's own controls live in the composer now.
  const showPresentationDock = !!discussionRequest || (activeRole === 'agent' && !!speakingStudent);
  const toolbar = (
    <CanvasToolbar
      className="shrink-0 h-8 px-3 border-b border-gray-100/40 dark:border-gray-700/30"
      currentSceneIndex={currentSceneIndex}
      scenesCount={scenesCount}
      engineState={
        engineMode === 'playing' || engineMode === 'live'
          ? 'playing'
          : engineMode === 'paused'
            ? 'paused'
            : 'idle'
      }
      isLiveSession={isStreaming || isTopicPending || engineMode === 'live'}
      isSoftClosing={isSoftClosing}
      softCloseDeadline={softCloseDeadline}
      whiteboardOpen={whiteboardOpen}
      sidebarCollapsed={sidebarCollapsed}
      chatCollapsed={chatCollapsed}
      onToggleSidebar={onToggleSidebar}
      onToggleChat={onToggleChat}
      onPrevSlide={onPrevSlide ?? (() => {})}
      onNextSlide={onNextSlide ?? (() => {})}
      onPlayPause={onPlayPause ?? (() => {})}
      onWhiteboardClose={onWhiteboardClose ?? (() => {})}
      isPresenting={isPresenting}
      onTogglePresentation={onTogglePresentation}
      showStopDiscussion={showStopButton}
      onStopDiscussion={onStopDiscussion}
      onContinueDiscussion={onContinueDiscussion}
      ttsEnabled={ttsEnabled}
      ttsMuted={ttsMuted}
      ttsVolume={ttsVolume}
      onToggleMute={() => ttsEnabled && setTTSMuted(!ttsMuted)}
      onVolumeChange={(v) => setTTSVolume(v)}
      autoPlayLecture={autoPlayLecture}
      onToggleAutoPlay={() => setAutoPlayLecture(!autoPlayLecture)}
      playbackSpeed={playbackSpeed}
      onCycleSpeed={handleCycleSpeed}
      showElementReference={showElementReference}
      canPickSlideElement={canPickSlideElement}
      elementPickActive={elementPickActive}
      onToggleElementPick={onToggleElementPick}
    />
  );
  if (isPresenting) {
    return (
      <div className="h-0 w-full relative z-10 overflow-visible">
        {/* Speech overlay — fills the full stage area via absolute positioning */}
        <PresentationSpeechOverlay
          playbackView={enrichedPlaybackView}
          participants={initialParticipants}
          speakingAgentId={speakingAgentId ?? null}
          isTopicPending={!!isTopicPending}
          side="left"
          onBubbleClick={handlePresentationBubbleClick}
          audioIndicatorState={audioIndicatorState ?? 'idle'}
          buttonState={enrichedPlaybackView?.buttonState}
          isPaused={isDiscussionPaused || engineMode === 'paused'}
        />

        {/* ── Toolbar — pinned to bottom of screen ── */}
        <div
          className={cn(
            'fixed bottom-0 left-0 z-[40] pointer-events-none flex items-center justify-center transition-all duration-300',
            controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
          )}
          style={{ right: sidePanelInset }}
        >
          <div className="mb-3 px-2 py-1 rounded-full bg-white/70 dark:bg-black/60 backdrop-blur-xl border border-gray-200/60 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] pointer-events-auto">
            {toolbar}
          </div>
        </div>

        {/* ── End flash notification ── */}
        <AnimatePresence>
          {endFlashVisible && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: [10, 0, 0, 6],
                scale: [0.9, 1, 1, 0.95],
              }}
              transition={{
                duration: 1.8,
                times: [0, 0.15, 0.7, 1],
                ease: 'easeOut',
              }}
              className="fixed bottom-20 -translate-x-1/2 z-[50] bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-700 dark:text-white px-3.5 py-1.5 rounded-full text-xs font-medium pointer-events-none"
              style={{
                left: `calc((100vw - ${sidePanelInset}px) / 2)`,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block mr-1.5" />
              {endFlashSessionType === 'discussion'
                ? t('roundtable.discussionEnded')
                : t('roundtable.qaEnded')}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Center stack: input / voice / thinking — anchored above toolbar ── */}
        <div
          className="fixed bottom-14 left-0 z-[50] flex flex-col items-center justify-center gap-3 pointer-events-none transition-[right] duration-300"
          style={{ right: sidePanelInset }}
        >
          {/* Director thinking indicator */}
          <AnimatePresence>
            {thinkingState?.stage === 'director' && !currentSpeech && !userMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2 px-4 py-2 bg-white/70 dark:bg-black/50 backdrop-blur-xl rounded-full border border-gray-200/60 dark:border-white/10"
              >
                <div className="flex gap-1">
                  {[0, 0.2, 0.4].map((delay) => (
                    <motion.div
                      key={delay}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1.2, delay }}
                      className="w-1.5 h-1.5 rounded-full bg-purple-400"
                    />
                  ))}
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                  {t('roundtable.thinking')}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right-side stack: bubble + dock — flex column, no hardcoded px ── */}
        <div
          className="fixed bottom-5 z-[48] flex flex-col items-end gap-3 pointer-events-none transition-[right] duration-300"
          style={{ right: 20 + sidePanelInset }}
        >
          {/* Right-side speech bubble (flows above dock via flex) */}
          <PresentationSpeechOverlay
            playbackView={enrichedPlaybackView}
            participants={initialParticipants}
            speakingAgentId={speakingAgentId ?? null}
            isTopicPending={!!isTopicPending}
            userAvatar={userAvatar}
            side="right"
            onBubbleClick={handlePresentationBubbleClick}
            audioIndicatorState={audioIndicatorState ?? 'idle'}
            buttonState={enrichedPlaybackView?.buttonState}
            isPaused={isDiscussionPaused || engineMode === 'paused'}
          />

          {/* Dock */}
          <AnimatePresence>
            {showPresentationDock && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="pointer-events-auto"
              >
                <div
                  ref={presentationActionAnchorRef}
                  className="flex items-center gap-2.5 rounded-full bg-white/70 dark:bg-black/60 backdrop-blur-xl border border-gray-200/60 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] px-2.5 py-2"
                >
                  {/* Speaking / discussion-requesting agent avatar — shows when
                      a student agent is actively speaking OR a discussion request
                      is pending (so the user can see who's asking before joining) */}
                  <AnimatePresence>
                    {((activeRole === 'agent' && speakingStudent) ||
                      presentationDiscussionParticipant) && (
                      <motion.div
                        ref={presentationAgentAvatarRef}
                        key={`dock-agent-${(speakingStudent || presentationDiscussionParticipant)?.id}`}
                        initial={{ opacity: 0, scale: 0.8, width: 0 }}
                        animate={{ opacity: 1, scale: 1, width: 'auto' }}
                        exit={{ opacity: 0, scale: 0.8, width: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="shrink-0 overflow-hidden"
                      >
                        <div className="relative w-10 h-10 rounded-full flex items-center justify-center">
                          <div className="absolute inset-0 rounded-full border-2 border-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.3)] transition-all duration-300" />
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden relative z-10 text-lg">
                            <AvatarDisplay
                              src={
                                (speakingStudent || presentationDiscussionParticipant)?.avatar ||
                                '/avatars/user.png'
                              }
                              alt={
                                (speakingStudent || presentationDiscussionParticipant)?.name || ''
                              }
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <AnimatePresence>
                  {discussionRequest && (
                    <ProactiveCard
                      action={discussionRequest}
                      mode={engineMode === 'paused' ? 'paused' : 'playback'}
                      anchorRef={presentationAgentAvatarRef}
                      portalContainer={fullscreenContainerRef?.current}
                      align="left"
                      agentName={
                        presentationDiscussionParticipant?.name ||
                        presentationDiscussionAgentConfig?.name
                      }
                      agentAvatar={
                        presentationDiscussionParticipant?.avatar ||
                        presentationDiscussionAgentConfig?.avatar
                      }
                      agentColor={presentationDiscussionAgentConfig?.color}
                      onSkip={() => onDiscussionSkip?.()}
                      onListen={() => onDiscussionStart?.(discussionRequest)}
                      onTogglePause={() => onPlayPause?.()}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'h-[192px] w-full flex flex-col relative z-10 transition-all duration-300',
        isPresenting && !controlsVisible
          ? 'border-t border-transparent bg-transparent backdrop-blur-none'
          : 'border-t border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md',
      )}
    >
      {/* ── Toolbar strip — merged from CanvasArea ── */}
      <div
        className={cn(
          'transition-opacity duration-300',
          isPresenting && !controlsVisible && 'opacity-0 pointer-events-none',
        )}
      >
        {toolbar}
      </div>
      {/* ── Interaction area — three-column layout ── */}
      <div className="flex-1 flex items-stretch min-h-0">
        {/* Left: Teacher identity */}
        <div
          className={cn(
            'w-[90px] shrink-0 flex flex-col border-r border-gray-100/50 dark:border-gray-700/50 bg-white/40 dark:bg-gray-900/40 overflow-visible relative transition-opacity duration-300',
            isPresenting && !controlsVisible && 'opacity-0 pointer-events-none',
          )}
        >
          {/* Decorative Element (Top) */}
          <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-purple-50/50 dark:from-purple-900/10 to-transparent pointer-events-none" />
          <div className="absolute top-3 inset-x-0 flex flex-col items-center justify-center gap-1 opacity-10 pointer-events-none">
            <BookOpen size={20} className="text-purple-900 dark:text-purple-100" />
            <div className="w-8 h-0.5 bg-purple-900 dark:bg-purple-100 rounded-full" />
          </div>

          {/* Main Content */}
          <div className="flex-1 flex items-center justify-center gap-3 px-2 min-h-0 pb-1 pt-8">
            {/* Avatar Group (Left) */}
            <div
              ref={teacherAvatarRef}
              className="relative group cursor-pointer flex flex-col items-center justify-center gap-1"
            >
              <HoverCard openDelay={300} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={cn(
                        'relative w-12 h-12 rounded-full transition-all duration-500 flex items-center justify-center',
                        activeRole === 'teacher' ? 'scale-105' : 'opacity-90 scale-95',
                      )}
                    >
                      <div
                        className={cn(
                          'absolute inset-0 rounded-full border-2 transition-all duration-500',
                          activeRole === 'teacher'
                            ? 'border-purple-500 dark:border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                            : 'border-gray-200 dark:border-gray-700 group-hover:border-purple-300 dark:group-hover:border-purple-600',
                        )}
                      />

                      <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 overflow-hidden relative z-10 shadow-sm border border-gray-50 dark:border-gray-700">
                        <img
                          src={teacherAvatar}
                          alt={teacherName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {activeRole === 'teacher' && (
                        <div className="absolute -right-0.5 top-0.5 w-4 h-4 bg-green-500 dark:bg-green-400 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center z-20">
                          <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                        </div>
                      )}
                    </div>

                    <span
                      className={cn(
                        'max-w-[80px] truncate px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border shadow-sm transition-all duration-300 bg-white/90 dark:bg-gray-800/90',
                        activeRole === 'teacher' && !speakingStudent
                          ? 'text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-700'
                          : 'text-gray-400 dark:text-gray-500 border-gray-100 dark:border-gray-700 group-hover:text-purple-500 dark:group-hover:text-purple-400 group-hover:border-purple-200 dark:group-hover:border-purple-600',
                      )}
                    >
                      {teacherName}
                    </span>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent
                  side="bottom"
                  align="center"
                  className="w-64 p-3 max-h-[300px] overflow-y-auto"
                >
                  {(() => {
                    const teacherConfig = getAgentConfig(teacherParticipant?.id || '');
                    return (
                      <>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800">
                            <img
                              src={teacherAvatar}
                              alt={teacherName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{teacherName}</p>
                            <span
                              className="inline-block text-[10px] leading-tight px-1.5 py-0.5 rounded-full text-white mt-0.5"
                              style={{
                                backgroundColor: teacherConfig?.color || '#8b5cf6',
                              }}
                            >
                              {t('settings.agentRoles.teacher')}
                            </span>
                          </div>
                        </div>
                        {teacherConfig?.persona && (
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed whitespace-pre-line">
                            {teacherConfig.persona}
                          </p>
                        )}
                      </>
                    );
                  })()}
                </HoverCardContent>
              </HoverCard>

              {/* ProactiveCard from teacher avatar */}
              <AnimatePresence>
                {discussionRequest && discussionRequest.agentId === teacherParticipant?.id && (
                  <ProactiveCard
                    action={discussionRequest}
                    mode={engineMode === 'paused' ? 'paused' : 'playback'}
                    anchorRef={teacherAvatarRef}
                    align="left"
                    agentName={teacherName}
                    agentAvatar={teacherAvatar}
                    agentColor={getAgentConfig(teacherParticipant?.id || '')?.color}
                    onSkip={() => onDiscussionSkip?.()}
                    onListen={() => onDiscussionStart?.(discussionRequest)}
                    onTogglePause={() => onPlayPause?.()}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Center: Interaction stage */}
        <div className="flex-1 relative mx-3 mb-2">
          {/* End flash banner (Issue 3) */}
          <AnimatePresence>
            {endFlashVisible && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.9 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  y: [-10, 0, 0, -6],
                  scale: [0.9, 1, 1, 0.95],
                }}
                transition={{
                  duration: 1.8,
                  times: [0, 0.15, 0.7, 1],
                  ease: 'easeOut',
                }}
                className="absolute top-1 left-1/2 -translate-x-1/2 z-50 bg-gray-800/80 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-xs font-medium pointer-events-none"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block mr-1.5" />
                {endFlashSessionType === 'discussion'
                  ? t('roundtable.discussionEnded')
                  : t('roundtable.qaEnded')}
              </motion.div>
            )}
          </AnimatePresence>

          <div
            data-testid="roundtable-non-presentation-card"
            className="relative w-full h-full rounded-[2.5rem] bg-gradient-to-b from-white/40 to-white/80 dark:from-gray-800/40 dark:to-gray-800/80 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05),inset_0_1px_0_0_rgba(255,255,255,0.9)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col justify-center px-6 overflow-hidden group transition-all duration-700 cursor-default"
          >
            {/* Thinking dots (Issue 5) */}
            <AnimatePresence>
              {thinkingState?.stage === 'director' && !currentSpeech && !userMessage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-full shadow-sm border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex gap-1">
                    <motion.div
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.2,
                        delay: 0,
                      }}
                      className="w-1.5 h-1.5 rounded-full bg-purple-500"
                    />
                    <motion.div
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.2,
                        delay: 0.2,
                      }}
                      className="w-1.5 h-1.5 rounded-full bg-purple-500"
                    />
                    <motion.div
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.2,
                        delay: 0.4,
                      }}
                      className="w-1.5 h-1.5 rounded-full bg-purple-500"
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                    {t('roundtable.thinking')}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat bubble */}
            <AnimatePresence mode="wait">
              {bubbleRole && (
                <motion.div
                  key={bubbleKey}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    filter: 'none',
                  }}
                  exit={{ opacity: 0, y: -8, transition: { duration: 0.12 } }}
                  transition={{ duration: 0.2, ease: [0.21, 1, 0.36, 1] }}
                  className="w-full flex items-center relative z-10"
                >
                  <div
                    className={cn(
                      'flex w-full transition-all duration-500',
                      bubbleRole === 'teacher' ? 'justify-start' : 'justify-end',
                    )}
                  >
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        if (bubbleRole === 'user') return;
                        // Topic pending: click Play to resume
                        if (isTopicPending) {
                          onResumeTopic?.();
                          return;
                        }
                        // QA/Discussion: buffer-level pause/resume (freeze text reveal, SSE continues)
                        if (isInLiveFlow) {
                          if (isDiscussionPaused) {
                            onDiscussionResume?.();
                          } else if (!thinkingState && currentSpeech) {
                            // Don't allow pause during thinking or before text arrives
                            onDiscussionPause?.();
                          }
                          return;
                        }
                        // Lecture playback: toggle play/pause
                        onPlayPause?.();
                      }}
                      className={cn(
                        'relative px-4 pt-2 pb-3 rounded-2xl text-[15px] leading-relaxed transition-all border w-[min(420px,calc(100%-3rem))] group/bubble flex flex-col max-h-[110px]',
                        bubbleRole === 'teacher' ? 'pl-4 pr-10' : 'pl-4 pr-10',
                        bubbleRole === 'user'
                          ? 'bg-purple-600/95 dark:bg-purple-500/95 backdrop-blur-sm border-purple-400/40 dark:border-purple-300/40 text-white rounded-br-sm shadow-md shadow-purple-300/30 dark:shadow-purple-800/30'
                          : bubbleRole === 'agent'
                            ? cn(
                                'bg-blue-50/95 dark:bg-blue-950/60 backdrop-blur-sm border-blue-200/60 dark:border-blue-800/60 text-gray-700 dark:text-gray-200 rounded-br-sm shadow-sm',
                                (isInLiveFlow || isTopicPending) &&
                                  'hover:shadow-md cursor-pointer',
                              )
                            : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-bl-sm shadow-sm hover:shadow-md cursor-pointer',
                      )}
                    >
                      {bubbleRole &&
                        (() => {
                          const bubbleAvatar =
                            bubbleRole === 'user'
                              ? userAvatar
                              : bubbleRole === 'agent'
                                ? speakingStudent?.avatar || userAvatar
                                : teacherAvatar;
                          return (
                            <div
                              className={cn(
                                'absolute -top-2.5 z-20 pointer-events-none select-none',
                                bubbleRole === 'teacher' ? '-left-2.5' : '-right-2.5',
                              )}
                              title={bubbleName}
                            >
                              <div
                                className={cn(
                                  'w-6 h-6 rounded-full overflow-hidden border-2 shadow-sm',
                                  bubbleRole === 'user'
                                    ? 'border-purple-400 dark:border-purple-500'
                                    : bubbleRole === 'agent'
                                      ? 'border-blue-300 dark:border-blue-600'
                                      : 'border-purple-200 dark:border-purple-700',
                                )}
                              >
                                <AvatarDisplay src={bubbleAvatar} alt={bubbleName} />
                              </div>
                            </div>
                          );
                        })()}

                      <div ref={bubbleScrollRef} className="overflow-y-auto scrollbar-hide">
                        {/* Agent name + audio indicator header */}
                        {bubbleRole !== 'user' && bubbleName && (
                          <div className="flex items-center gap-1 mb-0.5">
                            <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 truncate">
                              {bubbleName}
                            </span>
                            {(() => {
                              const aiState =
                                speakingAgentId === audioAgentId
                                  ? (audioIndicatorState ?? 'idle')
                                  : 'idle';
                              if (aiState === 'generating')
                                return (
                                  <Loader2 className="w-3 h-3 text-amber-500 dark:text-amber-400 animate-spin" />
                                );
                              if (aiState === 'playing')
                                return (
                                  <Volume2 className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                                );
                              return null;
                            })()}
                          </div>
                        )}
                        {isBubbleLoading ? (
                          <div className="flex gap-1 items-center py-1">
                            <motion.div
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{
                                repeat: Infinity,
                                duration: 1,
                                delay: 0,
                              }}
                              className={cn(
                                'w-1.5 h-1.5 rounded-full',
                                isAgentLoading
                                  ? 'bg-blue-400 dark:bg-blue-500'
                                  : 'bg-purple-400 dark:bg-purple-500',
                              )}
                            />
                            <motion.div
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{
                                repeat: Infinity,
                                duration: 1,
                                delay: 0.2,
                              }}
                              className={cn(
                                'w-1.5 h-1.5 rounded-full',
                                isAgentLoading
                                  ? 'bg-blue-400 dark:bg-blue-500'
                                  : 'bg-purple-400 dark:bg-purple-500',
                              )}
                            />
                            <motion.div
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{
                                repeat: Infinity,
                                duration: 1,
                                delay: 0.4,
                              }}
                              className={cn(
                                'w-1.5 h-1.5 rounded-full',
                                isAgentLoading
                                  ? 'bg-blue-400 dark:bg-blue-500'
                                  : 'bg-purple-400 dark:bg-purple-500',
                              )}
                            />
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap break-words" suppressHydrationWarning>
                            {sourceText}
                            {isTopicPending && (
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 ml-1 align-middle" />
                            )}
                          </p>
                        )}
                      </div>

                      {/* Playback state icon (hidden during loading — dots already indicate activity) */}
                      {bubbleRole !== 'user' &&
                        !isBubbleLoading &&
                        (() => {
                          const btnState = playbackView?.buttonState ?? 'none';
                          const barsColor =
                            bubbleRole === 'agent' ? 'bg-blue-500' : 'bg-purple-500';

                          if (btnState === 'none') return null;

                          if (btnState === 'play') {
                            return (
                              <div className="absolute right-2.5 bottom-2.5 p-1.5 rounded-full bg-gray-50/80 dark:bg-gray-700/80 hover:bg-purple-100 dark:hover:bg-purple-900/50 group-hover/bubble:bg-purple-100 dark:group-hover/bubble:bg-purple-900/50 transition-all duration-300 cursor-pointer">
                                <Play className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 group-hover/bubble:text-purple-600 dark:group-hover/bubble:text-purple-400 ml-0.5" />
                              </div>
                            );
                          }

                          if (btnState === 'restart') {
                            return (
                              <div className="absolute right-2.5 bottom-2.5 p-1.5 rounded-full bg-gray-50/80 dark:bg-gray-700/80 hover:bg-purple-100 dark:hover:bg-purple-900/50 group-hover/bubble:bg-purple-100 dark:group-hover/bubble:bg-purple-900/50 transition-all duration-300 cursor-pointer">
                                <Repeat className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 group-hover/bubble:text-purple-600 dark:group-hover/bubble:text-purple-400" />
                              </div>
                            );
                          }

                          // btnState === 'bars'
                          return (
                            <div className="absolute right-2.5 bottom-2.5 p-1.5 rounded-full bg-gray-50/80 dark:bg-gray-700/80 group-hover/bubble:bg-purple-100 dark:group-hover/bubble:bg-purple-900/50 transition-all duration-300">
                              {isDiscussionPaused ? (
                                /* Paused: static Play icon */
                                <Play className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 group-hover/bubble:text-purple-600 dark:group-hover/bubble:text-purple-400 ml-0.5" />
                              ) : (
                                <>
                                  {/* Breathing bars — visible by default, hidden on hover */}
                                  <div className="flex gap-0.5 items-end justify-center h-3.5 w-3.5 group-hover/bubble:hidden">
                                    <motion.div
                                      animate={{ height: ['20%', '100%', '20%'] }}
                                      transition={{
                                        repeat: Infinity,
                                        duration: 0.6,
                                      }}
                                      className={cn('w-1 rounded-full', barsColor)}
                                    />
                                    <motion.div
                                      animate={{ height: ['40%', '100%', '40%'] }}
                                      transition={{
                                        repeat: Infinity,
                                        duration: 0.4,
                                      }}
                                      className={cn('w-1 rounded-full', barsColor)}
                                    />
                                    <motion.div
                                      animate={{ height: ['20%', '80%', '20%'] }}
                                      transition={{
                                        repeat: Infinity,
                                        duration: 0.5,
                                      }}
                                      className={cn('w-1 rounded-full', barsColor)}
                                    />
                                  </div>
                                  {/* Pause icon on hover */}
                                  <Pause className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 hidden group-hover/bubble:block" />
                                </>
                              )}
                            </div>
                          );
                        })()}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Participants area */}
        <div
          className={cn(
            'w-[140px] shrink-0 flex flex-col py-3 border-l border-gray-100/50 dark:border-gray-700/50 bg-gray-50/30 dark:bg-gray-900/30 overflow-visible transition-opacity duration-300',
            isPresenting && !controlsVisible && 'opacity-0 pointer-events-none',
          )}
        >
          {/* Companion agent avatars — horizontal row, scrollable on overflow, arrows on hover */}
          <div className="flex-none relative group/scroll">
            {/* Left arrow */}
            <button
              onClick={() => {
                agentScrollRef.current?.scrollBy({
                  left: -80,
                  behavior: 'smooth',
                });
              }}
              className="absolute left-0 top-0 bottom-0 w-5 z-10 flex items-center justify-center bg-gradient-to-r from-gray-50/90 dark:from-gray-900/90 to-transparent opacity-0 group-hover/scroll:opacity-100 transition-opacity cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
            </button>

            <div
              ref={agentScrollRef}
              className="overflow-x-auto overflow-y-hidden px-2 scrollbar-hide"
              onWheel={(e) => {
                if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                  e.currentTarget.scrollLeft += e.deltaY;
                  e.preventDefault();
                }
              }}
            >
              <div className="flex gap-1 w-max py-1">
                {studentParticipants.map((student) => {
                  const isSpeaking = speakingAgentId === student.id;
                  const isThinkingAgent =
                    thinkingState?.stage === 'agent_loading' &&
                    thinkingState.agentId === student.id;
                  const agentConfig = getAgentConfig(student.id);
                  const roleLabelKey = agentConfig?.role as
                    | 'teacher'
                    | 'assistant'
                    | 'student'
                    | undefined;
                  const roleLabel = roleLabelKey ? t(`settings.agentRoles.${roleLabelKey}`) : '';
                  const i18nDescription = t(`settings.agentDescriptions.${student.id}`);
                  const description =
                    i18nDescription !== `settings.agentDescriptions.${student.id}`
                      ? i18nDescription
                      : agentConfig?.persona || '';
                  const hasDescription = !!description;
                  const isDiscussionAgent =
                    !!discussionRequest && discussionRequest.agentId === student.id;
                  return (
                    <div
                      key={student.id}
                      data-agent-id={student.id}
                      ref={(el) => {
                        if (el) studentAvatarRefs.current.set(student.id, el);
                        else studentAvatarRefs.current.delete(student.id);
                      }}
                      className="relative group/student shrink-0"
                    >
                      {/* Breathing glow for discussion agent */}
                      {isDiscussionAgent && (
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.7, 0, 0.7],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 2,
                            ease: 'easeInOut',
                          }}
                          className="absolute inset-0 rounded-full pointer-events-none"
                          style={{
                            border: `2px solid ${agentConfig?.color || '#d97706'}`,
                          }}
                        />
                      )}
                      <HoverCard openDelay={300} closeDelay={100}>
                        <HoverCardTrigger asChild>
                          <div
                            className={cn(
                              'relative w-9 h-9 rounded-full transition-all duration-300 cursor-pointer',
                              isSpeaking
                                ? 'opacity-100 grayscale-0 scale-110'
                                : 'opacity-50 grayscale-[0.2] scale-95 hover:opacity-100 hover:grayscale-0 hover:scale-100',
                            )}
                          >
                            <div
                              className={cn(
                                'absolute inset-0 rounded-full border-2 transition-all duration-300',
                                isSpeaking
                                  ? 'border-purple-500 dark:border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.4)]'
                                  : 'border-white dark:border-gray-700',
                              )}
                            />
                            <div className="absolute inset-0.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                              <img
                                src={student.avatar}
                                alt={student.name}
                                className="w-full h-full"
                              />
                            </div>
                            {/* Speaking indicator */}
                            {isSpeaking && (
                              <div className="absolute -right-0.5 -top-0.5 w-3 h-3 bg-green-500 rounded-full border border-white dark:border-gray-800 z-20 flex items-center justify-center">
                                <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                              </div>
                            )}
                            {/* Loading indicator (Issue 5) */}
                            {isThinkingAgent && (
                              <div className="absolute inset-0 rounded-full border-2 border-purple-400 border-t-transparent animate-spin z-20" />
                            )}
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent
                          side="bottom"
                          align="center"
                          className="w-64 p-3 max-h-[300px] overflow-y-auto"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800">
                              <img
                                src={student.avatar}
                                alt={student.name}
                                className="w-full h-full"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{student.name}</p>
                              {roleLabel && roleLabel !== `settings.agentRoles.${roleLabelKey}` && (
                                <span
                                  className="inline-block text-[10px] leading-tight px-1.5 py-0.5 rounded-full text-white mt-0.5"
                                  style={{
                                    backgroundColor: agentConfig?.color || '#6b7280',
                                  }}
                                >
                                  {roleLabel}
                                </span>
                              )}
                            </div>
                          </div>
                          {hasDescription && (
                            <p className="text-xs text-muted-foreground mt-2 leading-relaxed whitespace-pre-line">
                              {description}
                            </p>
                          )}
                        </HoverCardContent>
                      </HoverCard>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right arrow */}
            <button
              onClick={() => {
                agentScrollRef.current?.scrollBy({
                  left: 80,
                  behavior: 'smooth',
                });
              }}
              className="absolute right-0 top-0 bottom-0 w-5 z-10 flex items-center justify-center bg-gradient-to-l from-gray-50/90 dark:from-gray-900/90 to-transparent opacity-0 group-hover/scroll:opacity-100 transition-opacity cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {/* ProactiveCard for student/non-teacher agents — rendered via portal */}
            <AnimatePresence>
              {discussionRequest &&
                discussionRequest.agentId !== teacherParticipant?.id &&
                (() => {
                  const matchedStudent = studentParticipants.find(
                    (s) => s.id === discussionRequest.agentId,
                  );
                  const agentConfig = getAgentConfig(discussionRequest.agentId || '');
                  return (
                    <ProactiveCard
                      action={discussionRequest}
                      mode={engineMode === 'paused' ? 'paused' : 'playback'}
                      anchorRef={discussionAnchorRef}
                      align="left"
                      agentName={matchedStudent?.name || agentConfig?.name}
                      agentAvatar={matchedStudent?.avatar || agentConfig?.avatar}
                      agentColor={agentConfig?.color}
                      onSkip={() => onDiscussionSkip?.()}
                      onListen={() => onDiscussionStart?.(discussionRequest)}
                      onTogglePause={() => onPlayPause?.()}
                    />
                  );
                })()}
            </AnimatePresence>
          </div>

        </div>
      </div>
      {/* close interaction row */}
    </div>
  );
}
