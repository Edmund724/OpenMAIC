'use client';

/**
 * 原型输入区（wayfinder 票 P1）。这是已经拍板的部分，四个变体共用：
 * 常驻底部、文本 + 麦克风 + 发送 + 引用课件，无模型选择、无联网搜索、无建议问题卡。
 * 录音态原地变形；识别结果落进输入框，不自动发送。
 */

import { BookOpen, Mic, Send, Square, X } from 'lucide-react';
import { cn } from '@/lib/utils';

function WaveformBars() {
  return (
    <div className="flex h-6 items-center gap-[3px]">
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <span
          key={i}
          className="w-[3px] animate-pulse rounded-full bg-gradient-to-t from-purple-400 to-indigo-400"
          style={{
            height: `${10 + ((i * 7) % 16)}px`,
            animationDelay: `${i * 90}ms`,
            animationDuration: '900ms',
          }}
        />
      ))}
    </div>
  );
}

export interface ComposerProps {
  readonly recording: boolean;
  readonly cueUser: boolean;
  readonly draft: string;
  readonly recognizedText: string;
  readonly onDraftChange: (value: string) => void;
  readonly onToggleRecording: () => void;
  readonly onFinishRecording: () => void;
  readonly onSend: () => void;
  readonly floating?: boolean;
  /** 窄栏形态：按钮收成图标，供全屏时塞进右侧黑框。 */
  readonly compact?: boolean;
}

export function Composer({
  recording,
  cueUser,
  draft,
  recognizedText,
  onDraftChange,
  onToggleRecording,
  onFinishRecording,
  onSend,
  floating = false,
  compact = false,
}: ComposerProps) {
  return (
    <div
      className={cn(
        'relative',
        floating && !compact && 'w-[min(480px,calc(100vw-3rem))]',
        compact && 'w-full',
      )}
    >
      {cueUser && !recording && (
        <div className="mb-1.5 flex justify-center">
          <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
            轮到你了 · 说说你的想法
          </span>
        </div>
      )}

      {recording ? (
        <div className="flex items-center gap-3 rounded-2xl border border-purple-200 bg-white px-4 py-3 shadow-sm">
          <WaveformBars />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold tracking-wider text-purple-600 uppercase">
              正在听…
            </div>
            <div className="truncate text-sm text-gray-700">{recognizedText || '…'}</div>
          </div>
          <button
            onClick={onToggleRecording}
            aria-label="取消录音"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            onClick={onFinishRecording}
            aria-label="结束录音并填入输入框"
            className="flex h-8 items-center gap-1.5 rounded-full bg-purple-600 px-3 text-xs font-medium text-white hover:bg-purple-700"
          >
            <Square className="h-3 w-3" />
            完成
          </button>
        </div>
      ) : (
        <div
          className={cn(
            'rounded-2xl border bg-white transition-shadow',
            cueUser
              ? 'border-amber-400 shadow-[0_0_0_3px_rgba(245,158,11,0.15)]'
              : 'border-gray-200 shadow-sm',
          )}
        >
          <textarea
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                onSend();
              }
            }}
            rows={1}
            placeholder={compact ? '问点什么…' : '问点什么…（回车发送，Shift+回车换行）'}
            className="max-h-24 w-full resize-none bg-transparent px-3 pt-2.5 pb-1 text-sm text-gray-900 outline-none placeholder:text-gray-400"
          />
          <div className="flex items-center gap-1 px-2 pb-2">
            <button
              title="引用课件"
              className="flex h-7 items-center gap-1 rounded-full border border-gray-200 px-2 text-[11px] text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            >
              <BookOpen className="h-3.5 w-3.5" />
              {!compact && '引用课件'}
            </button>
            <button
              onClick={onToggleRecording}
              title="语音输入（V）"
              className={cn(
                'flex h-7 items-center gap-1 rounded-full border px-2 text-[11px]',
                cueUser
                  ? 'border-purple-300 bg-purple-50 text-purple-600'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700',
              )}
            >
              <Mic className="h-3.5 w-3.5" />
              {!compact && '说话'}
            </button>
            <div className="flex-1" />
            <button
              onClick={onSend}
              aria-label="发送"
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                draft.trim()
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-100 text-gray-300',
              )}
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
