/**
 * The student's words have one owner: the composer at the foot of the chat
 * panel, plus its fullscreen twin in the reserved column beside the slide.
 *
 * The strip along the bottom of the stage used to hold a second, competing
 * input — a textarea that opened on a click, a mic, and a send cooldown that
 * locked both. Two places that send is two places that drift, so this suite
 * pins the strip down to what it still owns: the avatar rows, the invitation
 * cards, and the anchors agent bubbles are positioned against.
 *
 * Read as source text on purpose — what is being guarded is the shape of the
 * component, not a runtime behaviour. The prototype tree keeps its own throwaway
 * composer and is excluded from the product scan.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(__dirname, '..', '..');
const ROUNDTABLE = 'components/roundtable/index.tsx';
const CHAT_AREA = 'components/chat/chat-area.tsx';
const CHROME = 'components/edit/PlaybackChromeRoot.tsx';
const COMPOSER = 'components/chat/composer.tsx';
const PROTOTYPE = 'components/prototype/';

function source(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

function count(text: string, pattern: RegExp): number {
  return text.match(pattern)?.length ?? 0;
}

function collectTsx(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const rel = `${dir}/${entry.name}`;
    if (entry.isDirectory()) collectTsx(rel, found);
    else if (entry.name.endsWith('.tsx')) found.push(rel);
  }
  return found;
}

const PRODUCT_TSX = collectTsx('components').filter((rel) => !rel.startsWith(PROTOTYPE));

const COMPOSER_MOUNTS = PRODUCT_TSX.filter((rel) => /<Composer[\s/>]/u.test(source(rel))).sort();

describe('the stage strip no longer owns the student’s words', () => {
  it('has dropped the text box, the mic, the send cooldown and the props behind them', () => {
    const strip = source(ROUNDTABLE);

    for (const gone of [
      'isInputOpen',
      'isVoiceOpen',
      'isSendCooldown',
      'handleToggleInput',
      'handleToggleVoice',
      'handleSendMessage',
      'onMessageSend',
      'onInputActivate',
      'onUserInputActivity',
      'inputValue',
      'nonPresentationInputRef',
      'VoiceWaveformBars',
      'useAudioRecorder',
      'asrEnabled',
      '<textarea',
      '<input',
      '<Mic',
      '<MicOff',
      '<Send',
    ]) {
      expect(strip, gone).not.toContain(gone);
    }
  });

  it('still echoes what the student said — as something already sent', () => {
    const strip = source(ROUNDTABLE);

    expect(strip).toContain('studentUtterance');
    expect(count(strip, /showLocalUserMessage\(/gu)).toBeGreaterThan(0);
    expect(strip.includes('chat/composer')).toBe(false);
  });
});

describe('the strip keeps what is still its own', () => {
  it('keeps the avatar rows and the anchors bubbles hang off', () => {
    const strip = source(ROUNDTABLE);

    expect(count(strip, /studentAvatarRefs\.current\.set\(/gu)).toBe(1);
    expect(count(strip, /teacherAvatarRef/gu)).toBeGreaterThan(0);
    expect(count(strip, /presentationActionAnchorRef/gu)).toBeGreaterThan(0);
    // Teacher, speaking student, and the non-teacher portal.
    expect(count(strip, /<ProactiveCard[\s/>]/gu)).toBe(3);
  });

  it('still reserves the fullscreen composer column, and the chrome honours it', () => {
    const strip = source(ROUNDTABLE);
    const chrome = source(CHROME);

    expect(strip).toContain('export const PRESENTATION_COMPOSER_COLUMN_PX = 268;');
    expect(count(strip, /PRESENTATION_COMPOSER_COLUMN_PX/gu)).toBeGreaterThan(1);
    expect(chrome).toContain('PRESENTATION_COMPOSER_COLUMN_PX');
    expect(chrome).toContain('presentation-composer-column');
  });
});

describe('the composer is the only place a student types', () => {
  it('mounts from the product tree twice: the panel and the fullscreen column', () => {
    expect(COMPOSER_MOUNTS).toEqual([CHAT_AREA, CHROME]);
    expect(count(source(CHAT_AREA), /<Composer[\s/>]/gu)).toBe(1);
    expect(count(source(CHROME), /<Composer[\s/>]/gu)).toBe(1);
  });

  it('owns the microphone the strip gave up', () => {
    expect(source(COMPOSER)).toContain('useAudioRecorder');
  });

  it('is wired to the panel’s own send in one place each', () => {
    expect(source(CHAT_AREA)).toContain('if (!onComposerSubmit) return;');
    expect(source(CHAT_AREA)).toContain('onComposerSubmit(text)');
    expect(source(CHROME)).toContain('onComposerSubmit={handleComposerSubmit}');
  });
});
