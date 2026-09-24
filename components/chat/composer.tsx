'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type ReactNode,
} from 'react';
import { Loader2, Mic, Send, Square, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/hooks/use-i18n';
import { useAudioRecorder } from '@/lib/hooks/use-audio-recorder';
import { useASRAvailable } from '@/lib/hooks/use-asr-available';

/** Must stay in sync with the textarea's `max-h-[100px]` class. */
export const COMPOSER_INPUT_MAX_HEIGHT_PX = 100;

/** `panel` = bottom of the chat tab; `fullscreen` = the column beside the slide. */
export type ComposerVariant = 'panel' | 'fullscreen';

/** The controls the global T / V / Escape shortcuts reach for. */
export interface ComposerHandle {
  focus: () => void;
  blur: () => void;
  startVoice: () => void;
  stopVoice: () => void;
  isRecording: () => boolean;
  hasFocus: () => boolean;
}

export interface ComposerProps {
  readonly variant: ComposerVariant;
  /** The draft, owned by the host (per display session). */
  readonly value: string;
  readonly onValueChange: (next: string) => void;
  /** Hands over the text only — engine semantics stay with the host. */
  readonly onSubmit: (text: string) => void;
  /** Focus / first keystroke → level-1 pause. */
  readonly onInputActivate?: () => void;
  /** Typing or starting a recording → keep a soft-closing session alive. */
  readonly onUserInputActivity?: () => void;
  /** "The input UI is in use" — feeds `onPresentationInteractionChange`. */
  readonly onActivityChange?: (active: boolean) => void;
  /** It is the student's turn: amber ring plus a hint above the box. */
  readonly isCueUser?: boolean;
  /** The engine is generating — sending is refused. */
  readonly disabled?: boolean;
  /**
   * Veto for a send that the host must refuse (e.g. the referenced element is
   * gone). Returning false keeps the draft so the student can drop the receipt
   * and send again.
   */
  readonly canSubmit?: () => boolean;
  /** The courseware-reference receipt, rendered above the box. */
  readonly elementReferencePill?: ReactNode;
}

/** Fold one recognized segment into the draft without losing what was typed. */
export function appendTranscription(draft: string, text: string): string {
  const segment = text.trim();
  if (!segment) return draft;
  if (!draft) return segment;
  return /\s$/u.test(draft) ? `${draft}${segment}` : `${draft} ${segment}`;
}

const VOICE_WAVE_BARS = [10, 17, 12, 19, 14, 9, 16, 11];

function VoiceWaveform() {
  return (
    <div className="flex h-6 items-center gap-[3px]">
      {VOICE_WAVE_BARS.map((height, index) => (
        <span
          key={index}
          className="w-[3px] animate-pulse rounded-full bg-gradient-to-t from-purple-400 to-indigo-400"
          style={{ height: `${height}px`, animationDelay: `${index * 90}ms` }}
        />
      ))}
    </div>
  );
}

export const Composer = forwardRef<ComposerHandle, ComposerProps>(function Composer(
  {
    variant,
    value,
    onValueChange,
    onSubmit,
    onInputActivate,
    onUserInputActivity,
    onActivityChange,
    isCueUser = false,
    disabled = false,
    canSubmit,
    elementReferencePill,
  },
  ref,
) {
  const { t } = useI18n();
  const asrAvailable = useASRAvailable();
  const isCompact = variant === 'fullscreen';
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Keeps the transcription callback reading the latest draft rather than the
  // one captured when recording started.
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const { isRecording, isProcessing, startRecording, stopRecording, cancelRecording } =
    useAudioRecorder({
      onTranscription: (text) => {
        const next = appendTranscription(valueRef.current, text);
        if (next === valueRef.current) {
          toast.info(t('roundtable.noSpeechDetected'));
          return;
        }
        // Recognized speech lands in the draft — it never sends on its own.
        valueRef.current = next;
        onValueChange(next);
      },
      onError: (error) => toast.error(error),
    });

  const isInUse = isRecording || isProcessing;

  useEffect(() => {
    onActivityChange?.(isInUse);
    return () => {
      if (isInUse) onActivityChange?.(false);
    };
  }, [isInUse, onActivityChange]);

  // Auto-grow the textarea up to the cap, then scroll inside it.
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, COMPOSER_INPUT_MAX_HEIGHT_PX)}px`;
  }, [value, variant]);

  const handleSend = useCallback(() => {
    if (disabled || isInUse || !value.trim()) return;
    if (canSubmit?.() === false) return;
    onSubmit(value);
  }, [canSubmit, disabled, isInUse, onSubmit, value]);

  const handleStartVoice = useCallback(() => {
    if (!asrAvailable || isProcessing) return;
    onInputActivate?.();
    onUserInputActivity?.();
    void startRecording();
  }, [asrAvailable, isProcessing, onInputActivate, onUserInputActivity, startRecording]);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => textareaRef.current?.focus(),
      blur: () => textareaRef.current?.blur(),
      startVoice: handleStartVoice,
      stopVoice: () => {
        if (isRecording) stopRecording();
      },
      isRecording: () => isRecording,
      hasFocus: () => document.activeElement === textareaRef.current,
    }),
    [handleStartVoice, isRecording, stopRecording],
  );

  const canSend = !disabled && !isInUse && value.trim().length > 0;

  return (
    <div
      data-testid="chat-composer"
      data-variant={variant}
      className="relative w-full"
      onMouseDown={(event) => event.stopPropagation()}
    >
      {isCueUser && !isInUse && (
        <div className="mb-1.5 flex justify-center">
          <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
            {t('roundtable.yourTurn')}
          </span>
        </div>
      )}

      {isInUse ? (
        <div
          data-testid="chat-composer-voice"
          className="flex items-center gap-2 rounded-2xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-800 px-3 py-2.5 shadow-sm"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-purple-500" />
          ) : (
            <VoiceWaveform />
          )}
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold tracking-wider text-purple-600 dark:text-purple-300 uppercase">
              {isProcessing ? t('roundtable.processing') : t('roundtable.listening')}
            </div>
            <div className="truncate text-xs text-gray-600 dark:text-gray-300">
              {value.trim() || '…'}
            </div>
          </div>
          {isRecording && (
            <>
              <button
                type="button"
                data-testid="chat-composer-voice-cancel"
                aria-label={t('common.cancel')}
                onClick={() => {
                  cancelRecording();
                  textareaRef.current?.focus();
                }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
              <button
                type="button"
                data-testid="chat-composer-voice-finish"
                onClick={stopRecording}
                className="flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-purple-600 px-3 text-xs font-medium text-white hover:bg-purple-700"
              >
                <Square className="h-3 w-3" />
                {t('roundtable.stopRecording')}
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          {elementReferencePill && <div className="mb-1.5 flex">{elementReferencePill}</div>}
          <div
            className={cn(
              'rounded-2xl border bg-white dark:bg-gray-800 transition-shadow',
              isCueUser
                ? 'border-amber-400 shadow-[0_0_0_3px_rgba(245,158,11,0.15)]'
                : 'border-gray-200 dark:border-gray-700 shadow-sm',
            )}
          >
            <textarea
              ref={textareaRef}
              data-testid="chat-composer-input"
              value={value}
              onChange={(event) => onValueChange(event.target.value)}
              onFocus={() => onInputActivate?.()}
              onBeforeInput={() => onUserInputActivity?.()}
              onCompositionStart={() => onUserInputActivity?.()}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              placeholder={t('roundtable.inputPlaceholder')}
              className="w-full max-h-[100px] min-h-[40px] resize-none overflow-y-auto bg-transparent px-3 pt-2.5 pb-1 text-sm text-gray-900 dark:text-gray-100 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
            <div className="flex items-center gap-1 px-2 pb-2">
              <button
                type="button"
                data-testid="chat-composer-voice-toggle"
                aria-label={t('chat.composer.voice')}
                title={t('chat.composer.voiceHint')}
                disabled={!asrAvailable}
                onClick={handleStartVoice}
                className={cn(
                  'flex h-7 shrink-0 items-center gap-1 rounded-full border border-gray-200 dark:border-gray-700 px-2 text-[11px]',
                  asrAvailable
                    ? 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/60 hover:text-gray-700 dark:hover:text-gray-200'
                    : 'cursor-not-allowed text-gray-300 dark:text-gray-600',
                )}
              >
                <Mic className="h-3.5 w-3.5" />
                {!isCompact && t('chat.composer.voice')}
              </button>
              <div className="flex-1" />
              <button
                type="button"
                data-testid="chat-composer-send"
                aria-label={t('chat.composer.send')}
                title={t('chat.composer.send')}
                disabled={!canSend}
                onClick={handleSend}
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors',
                  canSend
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-300 dark:text-gray-500',
                )}
              >
                {disabled ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
});
