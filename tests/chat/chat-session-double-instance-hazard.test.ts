// @vitest-environment jsdom
/**
 * T1 (`.scratch/classroom-chat-panel/issues/04-verify-double-instance.md`): what actually
 * happens when TWO `useChatSessions` instances coexist in one stage.
 *
 * This is the reproduction half of the ticket, not the reachability half. The reachability
 * question — can the app ever mount a second instance? — is answered by
 * `chat-session-mount-graph.test.ts`, which pins the product render graph to a single
 * `ChatArea` mount site. Here we deliberately mount two real `ChatArea`s (i.e. two real
 * `useChatSessions` hooks) against one real `useStageStore` and observe:
 *
 *   1. both instances seed their React state from `useStageStore.chats` and never subscribe
 *      to it, so neither sees the other's writes;
 *   2. every `sessions` change writes the WHOLE list back through `setChats`, so the later
 *      writer erases what the earlier one persisted (last write wins on the entire list);
 *   3. instance-local selection state (`activeSessionId` → `getActiveSessionType()`) stays
 *      with the instance that set it.
 *
 * READ THE POLARITY: these assertions describe the hazard, so they PASS while the hazard is
 * real. They are the evidence for "the race is real mechanically"; they are not a claim that
 * the app reaches it. If the session state is later sunk into zustand (single source of
 * truth), these tests turn red on purpose — that is the signal the refactor landed.
 */
import { act, createElement, createRef, type RefObject } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChatSession } from '@/lib/types/chat';

vi.mock('@/lib/hooks/use-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: 'en-US',
    setLocale: () => undefined,
  }),
}));

vi.mock('@/lib/utils/stage-storage', () => ({
  saveStageData: vi.fn().mockResolvedValue(undefined),
  saveStageDataIncremental: vi.fn().mockResolvedValue(undefined),
  loadStageData: vi.fn().mockResolvedValue(null),
}));

import { ChatArea, type ChatAreaRef } from '@/components/chat/chat-area';
import { useStageStore } from '@/lib/store/stage';

const SEED_ID = 'seed-1';

function session(id: string, title: string, type: ChatSession['type'] = 'qa'): ChatSession {
  return {
    id,
    type,
    title,
    status: 'completed',
    messages: [],
    config: { agentIds: ['default-1'], defaultAgentId: 'default-1' },
    toolCalls: [],
    pendingToolCalls: [],
    createdAt: 1,
    updatedAt: 2,
  };
}

const seedSession = session(SEED_ID, 'Seed session');

let container: HTMLDivElement;
let root: Root;
let refA: RefObject<ChatAreaRef | null>;
let refB: RefObject<ChatAreaRef | null>;
let writes: ChatSession[][];
let storeSetChats: (chats: ChatSession[]) => void;

function storedIds(): string[] {
  return useStageStore.getState().chats.map((entry) => entry.id);
}

function hostRoot(host: 'a' | 'b'): HTMLElement | null {
  return container.querySelector(`[data-testid="host-${host}"]`);
}

/**
 * A host's own conversation list, read out of its history overlay: the panel
 * shows one conversation at a time now, so the list only exists behind the
 * history button.
 */
function historyText(host: 'a' | 'b'): string {
  const root = hostRoot(host);
  const button = root?.querySelector('[data-testid="chat-history-open"]');
  if (button?.getAttribute('aria-expanded') !== 'true') {
    act(() => {
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
  }
  return root?.querySelector('[data-testid="chat-history-overlay"]')?.textContent ?? '';
}

function showChatTab(host: 'a' | 'b'): void {
  const ref = host === 'a' ? refA : refB;
  act(() => ref.current?.switchToTab('chat'));
}

beforeEach(async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  // jsdom has no `scrollIntoView`; the transcript scrolls its newest message into view on mount.
  Element.prototype.scrollIntoView = vi.fn();
  useStageStore.getState().clearStore();
  useStageStore.setState({
    stage: { id: 'stage-1', name: 'stage-1', createdAt: 1, updatedAt: 1 },
    scenes: [],
    currentSceneId: null,
    chats: [seedSession],
  });

  writes = [];
  storeSetChats = useStageStore.getState().setChats;
  useStageStore.setState({
    setChats: (chats: ChatSession[]) => {
      writes.push(chats);
      storeSetChats(chats);
    },
  });

  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  refA = createRef<ChatAreaRef>();
  refB = createRef<ChatAreaRef>();

  await act(async () => {
    root.render(
      createElement(
        'div',
        null,
        createElement('div', { 'data-testid': 'host-a' }, createElement(ChatArea, { ref: refA })),
        createElement('div', { 'data-testid': 'host-b' }, createElement(ChatArea, { ref: refB })),
      ),
    );
  });
  showChatTab('a');
  showChatTab('b');
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  useStageStore.setState({ setChats: storeSetChats });
  useStageStore.getState().clearStore();
  vi.unstubAllGlobals();
});

describe('two coexisting useChatSessions instances', () => {
  it('seeds both instances from useStageStore.chats and both write that list straight back', async () => {
    expect(storedIds()).toEqual([SEED_ID]);
    expect(writes.map((entry) => entry.map((chat) => chat.id))).toEqual([[SEED_ID], [SEED_ID]]);
    expect(historyText('a')).toContain('Seed session');
    expect(historyText('b')).toContain('Seed session');
  });

  it('never lets one instance observe the other write: the two session lists diverge', async () => {
    let aSessionId = '';
    await act(async () => {
      aSessionId = await refA.current!.createSession('qa', 'Session A');
    });

    // A wrote through to the shared store…
    expect(storedIds()).toEqual([SEED_ID, aSessionId]);
    // …but B is still rendering its own, older list.
    expect(historyText('a')).toContain('Session A');
    expect(historyText('b')).not.toContain('Session A');

    let bSessionId = '';
    await act(async () => {
      bSessionId = await refB.current!.createSession('qa', 'Session B');
    });

    // B's write replaces the WHOLE list — `setChats(sessions)`, no merge.
    expect(storedIds()).toEqual([SEED_ID, bSessionId]);
    expect(storedIds()).not.toContain(aSessionId);
    expect(writes.at(-1)?.map((chat) => chat.id)).toEqual([SEED_ID, bSessionId]);
    // A keeps showing the session that just left the persisted list: the two views disagree.
    expect(historyText('a')).toContain('Session A');
    expect(historyText('b')).toContain('Session B');
  });

  it('keeps selection state per instance: activeSessionId does not cross instances', async () => {
    expect(refA.current!.getActiveSessionType()).toBeNull();
    expect(refB.current!.getActiveSessionType()).toBeNull();

    await act(async () => {
      await refA.current!.createSession('qa', 'Session A');
    });

    expect(refA.current!.getActiveSessionType()).toBe('qa');
    expect(refB.current!.getActiveSessionType()).toBeNull();
  });
});
