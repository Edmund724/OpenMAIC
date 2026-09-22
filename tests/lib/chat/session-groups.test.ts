import { describe, expect, it } from 'vitest';
import type { ChatSession } from '@/lib/types/chat';
import { groupSessionsByDay } from '@/lib/chat/session-groups';

function session(id: string, createdAt: number): ChatSession {
  return {
    id,
    type: 'qa',
    title: id,
    status: 'completed',
    messages: [],
    config: { agentIds: ['default-1'] },
    toolCalls: [],
    pendingToolCalls: [],
    createdAt,
    updatedAt: createdAt,
  };
}

/** 2026-09-22 15:00 local — the day boundary is what these tests are about. */
const NOW = new Date(2026, 8, 22, 15, 0, 0).getTime();
const at = (day: number, hour: number, minute = 0) =>
  new Date(2026, 8, day, hour, minute, 0).getTime();

describe('groupSessionsByDay', () => {
  it('answers no groups for no sessions', () => {
    expect(groupSessionsByDay([], NOW)).toEqual([]);
  });

  it('keeps only the days that have conversations, newest day first', () => {
    const groups = groupSessionsByDay(
      [
        session('older', at(10, 9)),
        session('today-morning', at(22, 9)),
        session('yesterday', at(21, 23)),
        session('today-noon', at(22, 12)),
      ],
      NOW,
    );

    expect(groups.map((group) => group.label)).toEqual(['today', 'yesterday', 'earlier']);
    expect(groups[0].sessions.map((s) => s.id)).toEqual(['today-noon', 'today-morning']);
    expect(groups[1].sessions.map((s) => s.id)).toEqual(['yesterday']);
    expect(groups[2].sessions.map((s) => s.id)).toEqual(['older']);
  });

  it('splits on the calendar day, not on 24 hours', () => {
    const groups = groupSessionsByDay(
      [session('late-yesterday', at(21, 23, 59)), session('early-today', at(22, 0, 1))],
      NOW,
    );

    expect(groups.map((group) => [group.label, group.sessions[0].id])).toEqual([
      ['today', 'early-today'],
      ['yesterday', 'late-yesterday'],
    ]);
  });

  it('answers only the earlier group when that is all there is', () => {
    const groups = groupSessionsByDay([session('old', at(1, 8)), session('older', at(2, 8))], NOW);

    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe('earlier');
    // Newest first inside the group, too.
    expect(groups[0].sessions.map((s) => s.id)).toEqual(['older', 'old']);
  });

  it('keeps every conversation, in a group or another', () => {
    const sessions = [session('a', at(22, 1)), session('b', at(21, 1)), session('c', at(1, 1))];

    const grouped = groupSessionsByDay(sessions, NOW).flatMap((group) => group.sessions);

    expect(grouped).toHaveLength(3);
    expect(new Set(grouped.map((s) => s.id))).toEqual(new Set(['a', 'b', 'c']));
  });
});
