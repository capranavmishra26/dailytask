import { useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import { byDueDate, isTaskOverdue } from '../utils/date';

const CHECK_INTERVAL_MS = 1000;

/**
 * Watches the clock against incomplete tasks.
 *
 * - Ticks every second while the app is in the foreground.
 * - Re-checks immediately when the app returns from the background
 *   (JS timers are paused while backgrounded).
 * - Returns the set of overdue task ids (for the red "Overdue" tag) and the
 *   queue of overdue tasks that have not yet been alerted (for the popup).
 *   Because `overdueAlerted` is persisted, tasks that went overdue while the
 *   app was closed are alerted on the next launch, and each task alerts once.
 */
export function useOverdueMonitor(tasks) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const intervalId = setInterval(tick, CHECK_INTERVAL_MS);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') tick();
    });
    return () => {
      clearInterval(intervalId);
      subscription.remove();
    };
  }, []);

  const overdueIds = useMemo(
    () => new Set(tasks.filter((t) => isTaskOverdue(t, now)).map((t) => t.id)),
    [tasks, now],
  );

  const alertQueue = useMemo(
    () => tasks.filter((t) => overdueIds.has(t.id) && !t.overdueAlerted).sort(byDueDate),
    [tasks, overdueIds],
  );

  return { overdueIds, alertQueue };
}
