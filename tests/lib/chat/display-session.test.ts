import { describe, expect, it } from 'vitest';
import type { KVScope, KVStore } from '@openmaic/storage';
import {
  clearDisplaySession,
  loadDisplaySession,
  saveDisplaySession,
} from '@/lib/chat/display-session';

interface RecordedCall {
  operation: 'get' | 'set' | 'remove';
  key: string;
  scope: KVScope | undefined;
  value?: unknown;
}

function createFakeKv(seed: Record<string, unknown> = {}) {
  const values = new Map<string, unknown>(Object.entries(seed));
  const calls: RecordedCall[] = [];
  const kv: KVStore = {
    async get<T>(key: string, scope?: KVScope) {
      calls.push({ operation: 'get', key, scope });
      return (values.get(key) ?? null) as T | null;
    },
    async set<T>(key: string, value: T, scope?: KVScope) {
      calls.push({ operation: 'set', key, scope, value });
      values.set(key, value);
    },
    async remove(key: string, scope?: KVScope) {
      calls.push({ operation: 'remove', key, scope });
      values.delete(key);
    },
    async keys(prefix = '', scope?: KVScope) {
      calls.push({ operation: 'get', key: prefix, scope });
      return [...values.keys()].filter((key) => key.startsWith(prefix));
    },
  };
  return { kv, values, calls };
}

describe('display-session device storage', () => {
  it('stores the displayed session under the stage key in the device scope', async () => {
    const { kv, values, calls } = createFakeKv();

    await saveDisplaySession('stage-7', 'session-abc', { kv });

    expect([...values.keys()]).toEqual(['display-session:stage-7']);
    const stored = values.get('display-session:stage-7') as Record<string, unknown>;
    expect(stored.sessionId).toBe('session-abc');
    expect(typeof stored.updatedAt).toBe('string');
    expect(calls.every((call) => call.scope === 'device')).toBe(true);
  });

  it('reads back what it wrote', async () => {
    const { kv } = createFakeKv();

    await saveDisplaySession('stage-7', 'session-abc', { kv });

    expect(await loadDisplaySession('stage-7', { kv })).toBe('session-abc');
  });

  it('answers null for an unwritten stage', async () => {
    const { kv } = createFakeKv();

    expect(await loadDisplaySession('stage-1', { kv })).toBeNull();
  });

  it.each([
    ['a bare string', 'session-abc'],
    ['a missing sessionId', { updatedAt: new Date().toISOString() }],
    ['a non-string sessionId', { sessionId: 42, updatedAt: new Date().toISOString() }],
    ['an unparsable updatedAt', { sessionId: 'session-abc', updatedAt: 'yesterday' }],
    ['null', null],
  ])('answers null instead of throwing on %s', async (_label, bad) => {
    const { kv } = createFakeKv({ 'display-session:stage-7': bad });

    expect(await loadDisplaySession('stage-7', { kv })).toBeNull();
  });

  it('clears the stage key', async () => {
    const { kv, values } = createFakeKv();
    await saveDisplaySession('stage-7', 'session-abc', { kv });

    await clearDisplaySession('stage-7', { kv });

    expect([...values.keys()]).toEqual([]);
    expect(await loadDisplaySession('stage-7', { kv })).toBeNull();
  });
});
