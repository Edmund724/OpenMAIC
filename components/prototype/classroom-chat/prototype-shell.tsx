'use client';

/**
 * 原型外壳（wayfinder 票 P1）：把 URL 参数翻成状态，拼出「假课堂 + 面板变体 + 切换器」。
 * 所有开关都走 URL，所以刷新和分享都稳定；除了输入框里的草稿，没有本地状态。
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClassroomFrame, FullscreenStage } from './classroom-frame';
import { Composer } from './composer';
import { CURRENT_SESSION, MOCK_SESSIONS } from './mock-data';
import {
  PrototypeSwitcher,
  StateControls,
  buildUrl,
  readFlags,
  VARIANT_ORDER,
  type VariantKey,
} from './prototype-switcher';
import { VariantA, VariantB, VariantC, VariantCurrent, type PanelShared } from './variants';

/** 语音识别的假结果：点「完成」后落进输入框，而不是直接发送。 */
const RECOGNIZED_SAMPLE = '红黑树和 AVL 树的区别是';

export function PrototypeShell({ params }: { readonly params: Record<string, string> }) {
  const router = useRouter();
  const flags = readFlags(params);
  const variant: VariantKey = (VARIANT_ORDER as readonly string[]).includes(params.variant ?? '')
    ? (params.variant as VariantKey)
    : 'current';

  const [draft, setDraft] = useState('');
  const [currentId, setCurrentId] = useState(CURRENT_SESSION.id);
  const [newChat, setNewChat] = useState(false);

  const toggleParam = (key: string, on: boolean) => {
    router.replace(buildUrl(params, { [key]: on ? '' : '1' }), { scroll: false });
  };

  const sessions = MOCK_SESSIONS;
  const currentSession = sessions.find((session) => session.id === currentId) ?? CURRENT_SESSION;
  const empty = flags.emptyConversation || newChat;

  const composer = {
    recording: flags.recording,
    cueUser: flags.cueUser,
    draft,
    recognizedText: flags.recording ? RECOGNIZED_SAMPLE : '',
    onDraftChange: setDraft,
    onToggleRecording: () => toggleParam('rec', flags.recording),
    onFinishRecording: () => {
      setDraft(RECOGNIZED_SAMPLE);
      toggleParam('rec', true);
    },
    onSend: () => setDraft(''),
  };

  const shared: PanelShared = {
    flags,
    sessions,
    currentId,
    currentSession,
    empty,
    onPickSession: (id) => {
      setCurrentId(id);
      setNewChat(false);
    },
    onNewChat: () => {
      setNewChat(true);
      setDraft('');
    },
    composer,
  };

  const panel =
    variant === 'A' ? (
      <VariantA shared={shared} />
    ) : variant === 'B' ? (
      <VariantB shared={shared} />
    ) : variant === 'C' ? (
      <VariantC shared={shared} />
    ) : (
      <VariantCurrent shared={shared} />
    );

  return (
    <>
      <StateControls params={params} flags={flags} />
      {flags.fullscreen ? (
        <FullscreenStage composer={<Composer {...composer} compact />} />
      ) : (
        <ClassroomFrame
          showStudentControls={variant === 'current'}
          panel={panel}
          narrowPanel={flags.narrowPanel}
        />
      )}
      <PrototypeSwitcher current={variant} params={params} />
    </>
  );
}
