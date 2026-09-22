/**
 * Which day a conversation belongs to.
 *
 * The list has no per-row timestamp: time is expressed by the group heading
 * alone — the convention every AI chat product settled on. That makes the day
 * boundary the whole feature, so it lives here as a pure rule rather than in
 * the overlay's render code.
 *
 * Callers pass the conversations the list may show (a lecture never appears in
 * it) and an explicit `now`, because "today" is a fact about the reader, not
 * about the data.
 */
import type { ChatSession } from '@/lib/types/chat';

export type DayGroupLabel = 'today' | 'yesterday' | 'earlier';

export interface DayGroup {
  label: DayGroupLabel;
  sessions: ChatSession[];
}

function dayStart(time: number): number {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/** The previous calendar day's start — not `-86_400_000`, which DST breaks. */
function previousDayStart(time: number): number {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - 1);
  return date.getTime();
}

/** Newest day first, newest conversation first inside each day. Empty days are absent. */
export function groupSessionsByDay(sessions: ChatSession[], now: number): DayGroup[] {
  const today = dayStart(now);
  const yesterday = previousDayStart(now);
  const buckets: Record<DayGroupLabel, ChatSession[]> = { today: [], yesterday: [], earlier: [] };

  for (const session of [...sessions].sort((left, right) => right.createdAt - left.createdAt)) {
    const started = dayStart(session.createdAt);
    if (started === today) buckets.today.push(session);
    else if (started === yesterday) buckets.yesterday.push(session);
    else buckets.earlier.push(session);
  }

  return (['today', 'yesterday', 'earlier'] as const)
    .map((label) => ({ label, sessions: buckets[label] }))
    .filter((group) => group.sessions.length > 0);
}
