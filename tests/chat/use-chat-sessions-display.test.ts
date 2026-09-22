// @vitest-environment jsdom

/**
 * The panel shows one conversation at a time, and *which* one is the student's
 * pointer — not the engine's. Three rules keep that pointer honest, and each is
 * a spot the panel can regress silently: where it lands when the stored pointer
 * no longer names a showable conversation, what sending into a finished
 * conversation does, and when an engine write counts as news.
 */
import { act, createElement, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChatSession, StatelessEvent } from '@/lib/types/chat';

const mocks = vi.hoisted(() => ({
  /** What the previous visit left on screen for this stage. */
  pointer: null as string | null,
  /** What one engine turn pushes into the session's buffer. */
  events: [] as StatelessEvent[],
}));

vi.mock('@/lib/hooks/use-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock('@/lib/chat/display-session', () => ({
  loadDisplaySession: async () => mocks.pointer,
  saveDisplaySession: async () => undefined,
  clearDisplaySession: async () => undefined,
}));

// A real loop POSTs /api/chat; here the events a test hands it stand in for a stream.
vi.mock('@/lib/chat/agent-loop', () => ({
  runAgentLoop: async (...args: unknown[]) => {
    const callbacks = args[1] as { onEvent: (event: StatelessEvent) => void };
    for (const event of mocks.events) callbacks.onEvent(event);
    return { reason: 'cue_user', turnCount: 1 };
  },
}));

vi.mock('@/lib/utils/model-config', () => ({
  getCurrentModelConfig: () => ({
    providerId: 'openai',
    modelId: 'test-model',
    modelString: 'openai:test-model',
    apiKey: 'test-key',
    baseUrl: '',
    providerType: 'openai',
    requiresApiKey: false,
    isServerConfigured: true,
    thinkingConfig: undefined,
  }),
}));

vi.mock('@/lib/config/feature-flags', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/config/feature-flags')>()),
  // The Pi backend swaps the loop for a single POST /api/chat/pi; pin the legacy path.
  isPiChatEnabled: () => false,
}));

import { useChatSessions } from '@/components/chat/use-chat-sessions';
import { useStageStore } from '@/lib/store/stage';

type ChatSessionsApi = ReturnType<typeof useChatSessions>;

let api!: ChatSessionsApi;

function captureApi(value: ChatSessionsApi): void {
  api = value;
}

/** A probe that hands the hook's latest return value to the test after each commit. */
function Probe() {
  const value = useChatSessions();
  useEffect(() => captureApi(value));
  return null;
}

function session(id: string, overrides: Partial<ChatSession> = {}): ChatSession {
  return {
    id,
    type: 'qa',
    title: id,
    status: 'completed',
    messages: [],
    config: { agentIds: ['default-1'], defaultAgentId: 'default-1' },
    toolCalls: [],
    pendingToolCalls: [],
    createdAt: 1,
    updatedAt: 2,
    ...overrides,
  };
}

function userTexts(target: ChatSession): string[] {
  return target.messages
    .filter((message) => message.role === 'user')
    .map((message) =>
      message.parts.map((part) => (part.type === 'text' ? part.text : '')).join(''),
    );
}

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  mocks.pointer = null;
  mocks.events = [];
  useStageStore.getState().clearStore();
  useStageStore.setState({
    stage: { id: 'stage-1', name: 'stage-1', createdAt: 1, updatedAt: 1 },
    scenes: [],
    currentSceneId: null,
    chats: [],
  });
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  useStageStore.getState().clearStore();
  vi.unstubAllGlobals();
});

/** Mount the hook over a seeded stage and let the stored pointer restore settle. */
async function mount(chats: ChatSession[], pointer: string | null): Promise<void> {
  mocks.pointer = pointer;
  useStageStore.setState({ chats });
  await act(async () => {
    root.render(createElement(Probe));
  });
  await flush();
}

/** Let pending promises (and the buffer's tick loop, when asked) run to completion. */
async function flush(ms = 0): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
}

/**
 * Advance a conversation the panel is NOT showing: the engine streams into a
 * fresh one (the only open live conversation, which `resumeActiveSession`
 * picks) while the student keeps reading the one the pointer names.
 */
async function engineStreamsIntoFreshConversation(): Promise<string> {
  mocks.events = [
    {
      type: 'agent_start',
      data: { messageId: 'engine-message-1', agentId: 'default-1', agentName: 'Teacher' },
    },
  ];
  let created = '';
  await act(async () => {
    created = await api.createSession('qa', 'Another conversation');
  });
  await act(async () => {
    await api.resumeActiveSession();
  });
  await flush(120);
  return created;
}

describe('where the panel lands', () => {
  it('shows the newest non-lecture conversation when no pointer was stored', async () => {
    await mount(
      [
        session('session-old', { createdAt: 100 }),
        session('session-lecture', { type: 'lecture', createdAt: 500 }),
        session('session-new', { type: 'discussion', createdAt: 300 }),
      ],
      null,
    );

    expect(api.displaySessionId).toBe('session-new');
  });

  it('falls back to the newest conversation when the stored pointer names one that is gone', async () => {
    await mount(
      [
        session('session-old', { createdAt: 100 }),
        session('session-lecture', { type: 'lecture', createdAt: 500 }),
        session('session-new', { type: 'discussion', createdAt: 300 }),
      ],
      'session-gone',
    );

    expect(api.displaySessionId).toBe('session-new');
  });

  it('never shows a lecture, even when the stored pointer names one', async () => {
    await mount(
      [
        session('session-old', { createdAt: 100 }),
        session('session-lecture', { type: 'lecture', createdAt: 500 }),
      ],
      'session-lecture',
    );

    expect(api.displaySessionId).toBe('session-old');
  });

  it('shows nothing on a stage with no conversations', async () => {
    await mount([], null);

    expect(api.displaySessionId).toBeNull();
  });

  it('keeps the stored pointer while it still names a showable conversation', async () => {
    await mount(
      [session('session-old', { createdAt: 100 }), session('session-new', { createdAt: 300 })],
      'session-old',
    );

    expect(api.displaySessionId).toBe('session-old');
  });
});

describe('sending into a finished conversation', () => {
  it('revives it in place instead of starting a new one', async () => {
    const finished = session('session-done', {
      status: 'completed',
      title: '第一段的题目',
      messages: [
        {
          id: 'agent-message-1',
          role: 'assistant',
          parts: [{ type: 'text', text: '第一段的回答' }],
          metadata: { originalRole: 'agent', senderName: 'Teacher' },
        },
      ],
    });
    await mount([finished], 'session-done');
    expect(api.displaySessionId).toBe('session-done');

    await act(async () => {
      await api.sendMessage('再讲讲这一点');
    });

    const revived = api.sessions.find((entry) => entry.id === 'session-done')!;
    expect(api.sessions.map((entry) => entry.id)).toEqual(['session-done']);
    expect(revived.status).toBe('active');
    expect(revived.title).toBe('第一段的题目');
    expect(userTexts(revived)).toEqual(['再讲讲这一点']);
    expect(revived.messages.map((message) => message.role)).toEqual(['assistant', 'user']);
    expect(api.displaySessionId).toBe('session-done');
  });
});

describe('unread marks', () => {
  it('marks a conversation the engine wrote to while the student reads another', async () => {
    await mount([session('session-shown')], 'session-shown');
    const written = await engineStreamsIntoFreshConversation();

    expect(api.displaySessionId).toBe('session-shown');
    expect([...api.unreadSessionIds]).toEqual([written]);
  });

  it('clears the mark once the student switches to that conversation', async () => {
    await mount([session('session-shown')], 'session-shown');
    const written = await engineStreamsIntoFreshConversation();
    expect(api.unreadSessionIds.has(written)).toBe(true);

    await act(async () => {
      api.setDisplaySessionId(written);
    });

    expect(api.displaySessionId).toBe(written);
    expect(api.unreadSessionIds.size).toBe(0);
  });
});
