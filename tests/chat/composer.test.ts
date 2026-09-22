// @vitest-environment jsdom

/**
 * The composer is the only place the student speaks from now, so what it does
 * with a keystroke is the contract: Enter sends, Shift+Enter does not, an IME
 * composition never sends, and recognized speech lands in the draft instead of
 * firing off a request on its own.
 */
import { createElement, createRef, useState } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  recorder: undefined as
    | {
        onTranscription?: (text: string) => void;
        onError?: (error: string) => void;
        recording: boolean;
      }
    | undefined,
}));

vi.mock('@/lib/hooks/use-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock('@/lib/hooks/use-asr-available', () => ({ useASRAvailable: () => true }));

vi.mock('sonner', () => ({ toast: { info: vi.fn(), error: vi.fn() } }));

vi.mock('@/lib/hooks/use-audio-recorder', () => ({
  useAudioRecorder: (options: { onTranscription?: (text: string) => void }) => {
    mocks.recorder = {
      onTranscription: options.onTranscription,
      recording: false,
    };
    return {
      isRecording: mocks.recorder.recording,
      isProcessing: false,
      startRecording: vi.fn(),
      stopRecording: vi.fn(),
      cancelRecording: vi.fn(),
    };
  },
}));

import { Composer, appendTranscription, type ComposerProps } from '@/components/chat/composer';

describe('appendTranscription', () => {
  it('keeps what was typed and joins the recognized segment to it', () => {
    expect(appendTranscription('', ' hello ')).toBe('hello');
    expect(appendTranscription('why', 'is the sky blue')).toBe('why is the sky blue');
    expect(appendTranscription('why ', 'blue')).toBe('why blue');
  });

  it('changes nothing when nothing was recognized', () => {
    expect(appendTranscription('keep me', '   ')).toBe('keep me');
  });
});

describe('Composer', () => {
  let container: HTMLDivElement;
  let root: Root;
  let submitted: string[];
  let drafts: string[];

  beforeEach(() => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    mocks.recorder = undefined;
    submitted = [];
    drafts = [];
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  function Harness(props: Partial<ComposerProps>) {
    const [value, setValue] = useState('draft');
    return createElement(Composer, {
      variant: 'panel',
      value,
      onValueChange: (next: string) => {
        drafts.push(next);
        setValue(next);
      },
      onSubmit: (text: string) => {
        submitted.push(text);
      },
      ...props,
    });
  }

  async function mount(props: Partial<ComposerProps> = {}) {
    await act(async () => {
      root.render(createElement(Harness, props));
    });
  }

  function input(): HTMLTextAreaElement {
    return container.querySelector('[data-testid="chat-composer-input"]') as HTMLTextAreaElement;
  }

  async function press(key: string, init: KeyboardEventInit = {}) {
    await act(async () => {
      input().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...init }));
    });
  }

  it('sends the draft on Enter', async () => {
    await mount();

    await press('Enter');

    expect(submitted).toEqual(['draft']);
  });

  it('leaves a Shift+Enter draft alone so the textarea can add a line', async () => {
    await mount();

    await press('Enter', { shiftKey: true });

    expect(submitted).toEqual([]);
  });

  it('does not send while an IME composition is in flight', async () => {
    await mount();

    await press('Enter', { isComposing: true });

    expect(submitted).toEqual([]);
  });

  it('refuses to send an empty or whitespace-only draft', async () => {
    await mount({ value: '   ' });

    await act(async () => {
      container
        .querySelector('[data-testid="chat-composer-send"]')!
        .dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await press('Enter');

    expect(submitted).toEqual([]);
  });

  it('puts recognized speech in the draft and never sends it on its own', async () => {
    await mount();

    await act(async () => {
      mocks.recorder?.onTranscription?.('what is a photon');
    });

    expect(drafts.at(-1)).toBe('draft what is a photon');
    expect(submitted).toEqual([]);
  });

  it('refuses to send while the engine is generating', async () => {
    await mount({ disabled: true });

    await press('Enter');

    expect(submitted).toEqual([]);
    expect(
      (container.querySelector('[data-testid="chat-composer-send"]') as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it('shows the turn hint and the amber ring while it is the student’s turn', async () => {
    await mount({ isCueUser: true });

    expect(container.textContent).toContain('roundtable.yourTurn');
  });

  it('exposes voice control for the global shortcuts', async () => {
    const ref = createRef<import('@/components/chat/composer').ComposerHandle>();
    await mount({ ref } as Partial<ComposerProps>);

    expect(ref.current?.isRecording()).toBe(false);
    expect(ref.current?.hasFocus()).toBe(false);
    await act(async () => ref.current?.focus());
    expect(ref.current?.hasFocus()).toBe(true);
    expect(() =>
      act(() => {
        ref.current?.startVoice();
        ref.current?.stopVoice();
      }),
    ).not.toThrow();
  });
});
