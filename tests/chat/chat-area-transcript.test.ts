// @vitest-environment jsdom

/**
 * The chat tab is one conversation, always. Two behaviours make that screen
 * usable: the transcript follows the stream only while the student is at the
 * bottom (otherwise a pill waits for them), and the thin status bar above the
 * composer says what the engine is doing and offers the one way out of it.
 */
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChatSession } from '@/lib/types/chat';

vi.mock('@/lib/hooks/use-i18n', () => ({
  useI18n: () => ({
    // Params are echoed onto the key so a test can see what the copy was handed.
    t: (key: string, params?: Record<string, string | number>) =>
      params
        ? `${key} ${Object.entries(params)
            .map(([name, value]) => `${name}=${value}`)
            .join(' ')}`
        : key,
  }),
}));

// jsdom lays nothing out, so the scroll call the transcript makes is a no-op here.
Element.prototype.scrollIntoView = () => {};

vi.mock('@/lib/store/user-profile', () => ({
  useUserProfileStore: (selector: (state: { avatar: string | null }) => unknown) =>
    selector({ avatar: null }),
}));

import { ChatSessionComponent } from '@/components/chat/chat-session';
import { ChatStatusBar } from '@/components/chat/chat-area';

function makeSession(overrides: Partial<ChatSession> = {}): ChatSession {
  return {
    id: 'session-1',
    type: 'qa',
    title: 'Q&A',
    status: 'active',
    messages: [
      {
        id: 'message-1',
        role: 'assistant',
        parts: [{ type: 'text', text: 'A finished answer' }],
        metadata: { originalRole: 'teacher', senderName: 'Teacher' },
      },
    ],
    config: { agentIds: ['default-1'] },
    toolCalls: [],
    pendingToolCalls: [],
    createdAt: 1,
    updatedAt: 2,
    ...overrides,
  };
}

describe('chat transcript', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  async function render(session: ChatSession) {
    await act(async () => {
      root.render(createElement(ChatSessionComponent, { session, isActive: true }));
    });
  }

  /**
   * jsdom has no layout: the scroll box is described by hand so "how far from
   * the bottom" is a number the test controls.
   */
  function scrollBox(scrollTop: number, scrollHeight = 600, clientHeight = 200) {
    const element = container.querySelector('[data-testid="chat-transcript"]') as HTMLElement;
    Object.defineProperty(element, 'scrollHeight', { value: scrollHeight, configurable: true });
    Object.defineProperty(element, 'clientHeight', { value: clientHeight, configurable: true });
    Object.defineProperty(element, 'scrollTop', {
      value: scrollTop,
      writable: true,
      configurable: true,
    });
    return element;
  }

  async function scroll(element: HTMLElement) {
    await act(async () => {
      element.dispatchEvent(new Event('scroll', { bubbles: true }));
    });
  }

  function pill(): HTMLElement | null {
    return container.querySelector('[data-testid="chat-new-content"]');
  }

  it('does not raise the pill while the student is following the stream', async () => {
    await render(makeSession());
    const box = scrollBox(400); // exactly at the bottom of a 600px box
    await scroll(box);

    await act(async () => {
      root.render(
        createElement(ChatSessionComponent, { session: makeSession(), isActive: true, isStreaming: true }),
      );
    });
    await act(async () => {
      root.render(
        createElement(ChatSessionComponent, {
          session: makeSession({ updatedAt: 3 }),
          isActive: true,
          isStreaming: true,
        }),
      );
    });

    expect(pill()).toBeNull();
  });

  it('raises the pill when text arrives while the student reads further up, and drops it on a click', async () => {
    await render(makeSession());
    const box = scrollBox(0); // 400px from the bottom
    await scroll(box);
    expect(pill()).toBeNull();

    await act(async () => {
      root.render(
        createElement(ChatSessionComponent, {
          session: makeSession({ updatedAt: 3 }),
          isActive: true,
          isStreaming: true,
        }),
      );
    });

    expect(pill()).not.toBeNull();

    await act(async () => {
      pill()!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(pill()).toBeNull();
  });

  it('treats a scroll position inside 24px of the bottom as following', async () => {
    await render(makeSession());
    const box = scrollBox(390); // 10px from the bottom
    await scroll(box);

    await act(async () => {
      root.render(
        createElement(ChatSessionComponent, {
          session: makeSession({ updatedAt: 4 }),
          isActive: true,
          isStreaming: true,
        }),
      );
    });

    expect(pill()).toBeNull();
  });

  it('keeps the ended marker in the transcript and leaves stop/continue to the status bar', async () => {
    await render(makeSession({ status: 'completed' }));

    expect(container.textContent).toContain('chat.ended');
    expect(container.textContent).not.toContain('chat.status.stop');
    expect(container.textContent).not.toContain('chat.softClosing');
  });
});

describe('chat status bar', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  async function render(element: ReturnType<typeof createElement>) {
    await act(async () => {
      root.render(element);
    });
  }

  it('renders nothing without a live conversation', async () => {
    await render(createElement(ChatStatusBar, { state: 'none' }));

    expect(container.querySelector('[data-testid="chat-status-bar"]')).toBeNull();
  });

  it('offers Stop while the engine answers', async () => {
    const onStop = vi.fn();
    await render(
      createElement(ChatStatusBar, { state: 'active', onStop, onContinue: vi.fn(), onBack: vi.fn() }),
    );

    expect(container.textContent).toContain('chat.status.answering');
    expect(container.textContent).toContain('chat.status.stop');
    act(() => {
      container.querySelectorAll('button')[0].dispatchEvent(
        new MouseEvent('click', { bubbles: true }),
      );
    });
    expect(onStop).toHaveBeenCalledOnce();
  });

  it('counts a soft-closing conversation down and offers Continue', async () => {
    const onContinue = vi.fn();
    await render(
      createElement(ChatStatusBar, {
        state: 'soft-closing',
        softCloseDeadline: Date.now() + 12_000,
        onStop: vi.fn(),
        onContinue,
        onBack: vi.fn(),
      }),
    );

    expect(container.querySelector('[data-testid="chat-status-bar"]')?.getAttribute('data-state')).toBe(
      'soft-closing',
    );
    expect(container.textContent).toContain('seconds=12');
    expect(container.textContent).toContain('chat.softClosing');
    act(() => {
      container.querySelectorAll('button')[0].dispatchEvent(
        new MouseEvent('click', { bubbles: true }),
      );
    });
    expect(onContinue).toHaveBeenCalledWith(expect.anything());
  });

  it('keeps a conversation running on the other side reachable with Go back', async () => {
    const onBack = vi.fn();
    await render(
      createElement(ChatStatusBar, {
        state: 'other',
        onStop: vi.fn(),
        onContinue: vi.fn(),
        onBack,
      }),
    );

    expect(container.textContent).toContain('chat.status.otherRunning');
    act(() => {
      container.querySelectorAll('button')[0].dispatchEvent(
        new MouseEvent('click', { bubbles: true }),
      );
    });
    expect(onBack).toHaveBeenCalledOnce();
  });
});
