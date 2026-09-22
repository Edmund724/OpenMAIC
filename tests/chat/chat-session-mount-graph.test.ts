/**
 * T1 (`.scratch/classroom-chat-panel/issues/04-verify-double-instance.md`):
 * can a stage ever hold TWO `useChatSessions` instances?
 *
 * The premise under test is the one recorded in `reports/chat-tab-optimization.md` D1:
 * "`components/scene-renderers/InteractiveIframeHost.tsx` 也会渲染 `PlaybackChromeRoot`，
 * 于是同一个 stage 可能出现两个 `useChatSessions` 实例".
 *
 * This suite walks the product import/JSX graph that leads to `useChatSessions` and pins its
 * shape. It is the guard for the race: it passes only while the chat session state has exactly
 * one owner per stage, and it goes red the moment a second mount site appears (a portal, an
 * overlay, a second classroom pane, a second root). What a second instance would DO — the
 * question the D1 ticket actually asks — is reproduced in
 * `chat-session-double-instance-hazard.test.ts`.
 *
 * Scanned roots are the product ones (`app/`, `components/`, `lib/`, `eval/`). `tests/` and
 * `e2e/` mount the chat graph themselves on purpose and are not part of this graph.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(__dirname, '..', '..');
const PRODUCT_ROOTS = ['app', 'components', 'lib', 'eval'];

function collect(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) collect(full, found);
    else if (/\.tsx?$/u.test(entry.name) && !entry.name.endsWith('.d.ts')) found.push(full);
  }
  return found;
}

function count(sourceText: string, pattern: RegExp): number {
  return sourceText.match(pattern)?.length ?? 0;
}

/** `rel path → source`, plus the two queries the mount-graph assertions are made of. */
function scanTree(sources: ReadonlyMap<string, string>) {
  /** Files whose text imports from this module specifier (`'…'` including the closing quote). */
  const importSites = (specifier: string): string[] =>
    [...sources.keys()].filter((rel) => sources.get(rel)!.includes(`'${specifier}'`)).sort();

  /**
   * Importers of a module, with the number of JSX sites for `tag` in each. A mount site needs
   * an import, so scoping the JSX scan to importers keeps prose that merely names a component
   * (e.g. the `<Stage>` in a `classroom-complete.tsx` comment) out of the count.
   */
  const mountSites = (tag: string, specifier: string): { rel: string; count: number }[] =>
    importSites(specifier).flatMap((rel) => {
      const sites = count(sources.get(rel)!, new RegExp(`<${tag}[\\s/>]`, 'gu'));
      return sites === 0 ? [] : [{ rel, count: sites }];
    });

  return { importSites, mountSites };
}

const PRODUCT_SOURCES = new Map<string, string>(
  PRODUCT_ROOTS.flatMap((root) => collect(join(ROOT, root))).map((file) => [
    relative(ROOT, file),
    readFileSync(file, 'utf8'),
  ]),
);

const { importSites, mountSites } = scanTree(PRODUCT_SOURCES);

function source(rel: string): string {
  const text = PRODUCT_SOURCES.get(rel);
  if (text === undefined) throw new Error(`not a scanned product file: ${rel}`);
  return text;
}

const CHAT_AREA = 'components/chat/chat-area.tsx';
const PLAYBACK_CHROME = 'components/edit/PlaybackChromeRoot.tsx';
const STAGE = 'components/stage.tsx';
const SURFACE = 'components/classroom/ClassroomSurface.tsx';
const IFRAME_HOST = 'components/scene-renderers/InteractiveIframeHost.tsx';

describe('useChatSessions has exactly one owner per stage', () => {
  it('is called from one component, and that component has one mount site', () => {
    expect(importSites('./use-chat-sessions')).toEqual([CHAT_AREA]);
    expect(count(source(CHAT_AREA), /useChatSessions\(/gu)).toBe(1);

    expect(importSites('@/components/chat/chat-area')).toEqual([PLAYBACK_CHROME]);
    expect(mountSites('ChatArea', '@/components/chat/chat-area')).toEqual([
      { rel: PLAYBACK_CHROME, count: 1 },
    ]);
  });

  it('mounts the chat panel from the playback branch of the stage mode swap only', () => {
    expect(importSites('@/components/edit/PlaybackChromeRoot')).toEqual([STAGE]);
    expect(mountSites('PlaybackChromeRoot', '@/components/edit/PlaybackChromeRoot')).toEqual([
      { rel: STAGE, count: 1 },
    ]);

    // The edit branch does not mount a chat panel, so a mode cross-fade cannot add one.
    expect(mountSites('EditChromeRoot', '@/components/edit/EditChromeRoot')).toEqual([
      { rel: STAGE, count: 1 },
    ]);
    for (const key of ['key="edit"', 'key="playback"', 'key="loading"']) {
      expect(count(source(STAGE), new RegExp(key, 'gu'))).toBe(1);
    }
  });

  it('mounts Stage once, and the classroom surface at one route and one pane', () => {
    expect(importSites('@/components/stage')).toEqual([SURFACE]);
    expect(mountSites('Stage', '@/components/stage')).toEqual([{ rel: SURFACE, count: 1 }]);

    // Two mutually exclusive surfaces: the standalone route and the workspace pane.
    expect(mountSites('ClassroomSurface', '@/components/classroom/ClassroomSurface')).toEqual([
      { rel: 'app/classroom/[id]/page.tsx', count: 1 },
      { rel: 'components/workbench/workspace/WorkspaceClassroomPane.tsx', count: 1 },
    ]);
    // …and the workspace shell holds at most one pane.
    expect(mountSites('WorkspaceClassroomPane', './WorkspaceClassroomPane')).toEqual([
      { rel: 'components/workbench/workspace/WorkspaceShell.tsx', count: 1 },
    ]);
  });

  it('does not mount the chat graph dynamically or from a second root', () => {
    for (const [rel, text] of PRODUCT_SOURCES) {
      expect(text, rel).not.toMatch(/createElement\(\s*(ChatArea|PlaybackChromeRoot)\b/u);
      expect(text, rel).not.toMatch(
        /(?:lazy|dynamic)\(\s*\(?\)?\s*=>\s*import\(\s*'@\/components\/(?:chat\/chat-area|edit\/PlaybackChromeRoot)'/u,
      );
    }
  });
});

describe('the interactive iframe host contributes no chat session instance', () => {
  it('does not render PlaybackChromeRoot or ChatArea', () => {
    const host = source(IFRAME_HOST);

    expect(count(host, /<PlaybackChromeRoot[\s/>]/gu)).toBe(0);
    expect(count(host, /<ChatArea[\s/>]/gu)).toBe(0);
    expect(host.includes('@/components/edit/PlaybackChromeRoot')).toBe(false);
    expect(host.includes('use-chat-sessions')).toBe(false);
    expect(host.includes('@/components/chat/chat-area')).toBe(false);
  });

  it('mentions PlaybackChromeRoot in the iframe-pool doc comment only — the D1 premise', () => {
    const mentions = source(IFRAME_HOST)
      .split('\n')
      .map((line, index) => ({ line: index + 1, text: line }))
      .filter((entry) => entry.text.includes('PlaybackChromeRoot'));

    expect(mentions).toHaveLength(1);
    // A doc-comment line (` * …`), never JSX: the report read this sentence as a render.
    expect(mentions[0].text.trimStart().startsWith('*')).toBe(true);
  });

  it('renders as a sibling of the chrome, outside the mode-swap subtree', () => {
    const stage = source(STAGE);
    const swapEnd = stage.indexOf('</AnimatePresence>');

    expect(swapEnd).toBeGreaterThan(-1);
    expect(stage.indexOf('<PlaybackChromeRoot')).toBeLessThan(swapEnd);
    expect(stage.indexOf('<InteractiveIframeHost')).toBeGreaterThan(swapEnd);
  });

  it('is imported by the playback chrome as types only', () => {
    const chrome = source(PLAYBACK_CHROME);
    const statement = chrome.slice(
      0,
      chrome.indexOf("'@/components/scene-renderers/InteractiveIframeHost'"),
    );

    expect(count(chrome, /<InteractiveIframeHost[\s/>]/gu)).toBe(0);
    expect(statement.slice(statement.lastIndexOf('import'))).toMatch(/^import type /u);
  });
});

describe('the mount-graph scan itself', () => {
  it('reports a second mount site — the shape a regression takes', () => {
    const twoHosts = new Map([
      [
        'components/stage.tsx',
        "import { PlaybackChromeRoot } from '@/components/edit/PlaybackChromeRoot';\nexport const S = () => <PlaybackChromeRoot />;\n",
      ],
      [
        'components/overlay.tsx',
        "import { PlaybackChromeRoot } from '@/components/edit/PlaybackChromeRoot';\nexport const O = () => <PlaybackChromeRoot />;\n",
      ],
    ]);

    expect(
      scanTree(twoHosts).mountSites('PlaybackChromeRoot', '@/components/edit/PlaybackChromeRoot'),
    ).toEqual([
      { rel: 'components/overlay.tsx', count: 1 },
      { rel: 'components/stage.tsx', count: 1 },
    ]);
  });

  it('counts a component named in prose as no mount site', () => {
    const prose = new Map([
      [
        'components/notes.tsx',
        '/** The slide lives inside the `<Stage>` frame. */\nexport const notes = "<Stage />";\n',
      ],
    ]);

    expect(scanTree(prose).mountSites('Stage', '@/components/stage')).toEqual([]);
  });
});
