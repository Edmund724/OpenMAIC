/**
 * Which conversation a stage's chat panel is showing, remembered per device.
 *
 * Not part of the canonical document and not shared across devices: this is
 * "what is on this screen", the same kind of fact as the playback cursor and
 * the editor's current scene. The session itself lives in the runtime store;
 * this key only points at it, and a pointer whose session is gone is answered
 * as if it had never been written.
 */
import { BrowserKVStore, type KVStore } from '@openmaic/storage';

export interface DisplaySessionDeps {
  kv?: KVStore;
}

const KEY_PREFIX = 'display-session:';
let defaultKv: KVStore | undefined;

function key(stageId: string): string {
  return `${KEY_PREFIX}${stageId}`;
}

function resolveKv(kv?: KVStore): KVStore {
  if (kv) return kv;
  if (typeof localStorage === 'undefined')
    throw new Error('Display-session persistence requires localStorage (client-only)');
  return (defaultKv ??= new BrowserKVStore());
}

interface DisplaySessionValue {
  sessionId: string;
  updatedAt: string;
}

function isDisplaySessionValue(value: unknown): value is DisplaySessionValue {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<DisplaySessionValue>;
  return (
    typeof candidate.sessionId === 'string' &&
    typeof candidate.updatedAt === 'string' &&
    Number.isFinite(Date.parse(candidate.updatedAt))
  );
}

export async function loadDisplaySession(
  stageId: string,
  deps: DisplaySessionDeps = {},
): Promise<string | null> {
  const value = await resolveKv(deps.kv).get<unknown>(key(stageId), 'device');
  return isDisplaySessionValue(value) ? value.sessionId : null;
}

export function saveDisplaySession(
  stageId: string,
  sessionId: string,
  deps: DisplaySessionDeps = {},
): Promise<void> {
  const value: DisplaySessionValue = { sessionId, updatedAt: new Date().toISOString() };
  return resolveKv(deps.kv).set(key(stageId), value, 'device');
}

export function clearDisplaySession(
  stageId: string,
  deps: DisplaySessionDeps = {},
): Promise<void> {
  return resolveKv(deps.kv).remove(key(stageId), 'device');
}
