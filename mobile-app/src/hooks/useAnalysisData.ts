import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listsService } from '../services/lists.service';
import { tasksService } from '../services/tasks.service';
import { stepsService } from '../services/steps.service';
import { ToDoList, Task, Step } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AnalysisData {
  /** ISO date string → completion count, every day in the trailing 90-day window */
  heatmapData: Record<string, number>;
  /** Consecutive-day suffix ending today or yesterday where ≥1 task was completed */
  streak: number;
  /** Last 30 days in ascending date order, one entry per day */
  trendData: { date: string; count: number }[];
  /** One entry per list; completed + pending = total tasks in that list */
  tasksByList: { listName: string; completed: number; pending: number }[];
  /** Due-date overview — no double-counting between buckets */
  dueDateOverview: {
    overdue: number;
    dueToday: number;
    dueThisWeek: number;
    withDueDate: number;
  };
  /** Steps progress across all tasks */
  stepsProgress: {
    tasksWithSteps: number;
    completedSteps: number;
    totalSteps: number;
  };
  loading: boolean;
  error: Error | null;
  retry: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Format a Date as an ISO date string (YYYY-MM-DD) in local time. */
function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Return a Date representing the start of the day (midnight) for the given date. */
function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// ─── Derivation functions (pure, exported for testing) ────────────────────────

/**
 * Build a heatmap covering the trailing 90 days (today inclusive).
 * Every day in the window has an entry; days with no completions have count 0.
 *
 * Requirements: 5.1
 */
export function deriveHeatmapData(tasks: Task[]): Record<string, number> {
  const today = startOfDay(new Date());
  const result: Record<string, number> = {};

  // Initialise every day in the 90-day window to 0
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    result[toISODate(d)] = 0;
  }

  // Count completions that fall within the window
  for (const task of tasks) {
    if (!task.completedAt) continue;
    const completedDate = toISODate(startOfDay(new Date(task.completedAt)));
    if (completedDate in result) {
      result[completedDate] += 1;
    }
  }

  return result;
}

/**
 * Compute the current completion streak.
 * The streak is the length of the longest consecutive-day suffix ending on
 * today or yesterday where at least one task was completed.
 *
 * Requirements: 5.2
 */
export function deriveStreak(tasks: Task[]): number {
  const today = startOfDay(new Date());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Collect the set of ISO date strings that have at least one completion
  const completedDays = new Set<string>();
  for (const task of tasks) {
    if (task.completedAt) {
      completedDays.add(toISODate(startOfDay(new Date(task.completedAt))));
    }
  }

  // Walk backwards from today; if today has no completions, try from yesterday
  const todayStr = toISODate(today);
  const yesterdayStr = toISODate(yesterday);

  let startDate: Date;
  if (completedDays.has(todayStr)) {
    startDate = today;
  } else if (completedDays.has(yesterdayStr)) {
    startDate = yesterday;
  } else {
    return 0;
  }

  let streak = 0;
  const cursor = new Date(startDate);
  while (completedDays.has(toISODate(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

/**
 * Build trend data for the last 30 days in ascending date order.
 * Every day has exactly one entry.
 *
 * Requirements: 5.3
 */
export function deriveTrendData(tasks: Task[]): { date: string; count: number }[] {
  const today = startOfDay(new Date());
  const counts: Record<string, number> = {};

  // Initialise all 30 days to 0
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    counts[toISODate(d)] = 0;
  }

  for (const task of tasks) {
    if (!task.completedAt) continue;
    const dateStr = toISODate(startOfDay(new Date(task.completedAt)));
    if (dateStr in counts) {
      counts[dateStr] += 1;
    }
  }

  // Return in ascending date order
  return Object.keys(counts)
    .sort()
    .map((date) => ({ date, count: counts[date] }));
}

/**
 * Group tasks by list, returning completed and pending counts per list.
 * completed + pending = total tasks in that list.
 *
 * Requirements: 5.4
 */
export function deriveTasksByList(
  lists: ToDoList[],
  tasks: Task[],
): { listName: string; completed: number; pending: number }[] {
  return lists.map((list) => {
    const listTasks = tasks.filter((t) => t.todoListId === list.id);
    const completed = listTasks.filter((t) => t.completed).length;
    const pending = listTasks.filter((t) => !t.completed).length;
    return { listName: list.name, completed, pending };
  });
}

/**
 * Compute due-date overview counts with no double-counting.
 *
 * Buckets (mutually exclusive for overdue/dueToday/dueThisWeek):
 *   - overdue:      dueDate < today AND not completed
 *   - dueToday:     dueDate is today AND not completed
 *   - dueThisWeek:  dueDate is tomorrow..6 days from now AND not completed
 *   - withDueDate:  all tasks that have a dueDate (regardless of completion)
 *
 * Requirements: 5.5
 */
export function deriveDueDateOverview(tasks: Task[]): {
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
  withDueDate: number;
} {
  const today = startOfDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekFromNow = new Date(today);
  weekFromNow.setDate(weekFromNow.getDate() + 7);

  let overdue = 0;
  let dueToday = 0;
  let dueThisWeek = 0;
  let withDueDate = 0;

  for (const task of tasks) {
    if (!task.dueDate) continue;
    withDueDate += 1;

    if (task.completed) continue;

    const due = startOfDay(new Date(task.dueDate));

    if (due < today) {
      overdue += 1;
    } else if (due.getTime() === today.getTime()) {
      dueToday += 1;
    } else if (due >= tomorrow && due < weekFromNow) {
      // dueThisWeek excludes today (already counted in dueToday)
      dueThisWeek += 1;
    }
  }

  return { overdue, dueToday, dueThisWeek, withDueDate };
}

/**
 * Compute steps progress across all tasks.
 * completedSteps ≤ totalSteps is guaranteed by construction.
 *
 * Requirements: 5.6
 */
export function deriveStepsProgress(
  tasks: Task[],
  stepsByTaskId: Record<string, Step[]>,
): { tasksWithSteps: number; completedSteps: number; totalSteps: number } {
  let tasksWithSteps = 0;
  let completedSteps = 0;
  let totalSteps = 0;

  for (const task of tasks) {
    const steps = stepsByTaskId[task.id] ?? [];
    if (steps.length > 0) {
      tasksWithSteps += 1;
      totalSteps += steps.length;
      completedSteps += steps.filter((s) => s.completed).length;
    }
  }

  return { tasksWithSteps, completedSteps, totalSteps };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

const EMPTY_LISTS: ToDoList[] = [];
const EMPTY_TASKS: Task[] = [];

/**
 * `useAnalysisData` — fetches lists and tasks (with steps) via React Query and
 * derives all analytics stats required by AnalysisScreen.
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9
 */
export function useAnalysisData(): AnalysisData {
  const queryClient = useQueryClient();

  // ── Fetch lists ────────────────────────────────────────────────────────────
  const {
    data: lists = EMPTY_LISTS,
    isLoading: listsLoading,
    error: listsError,
  } = useQuery<ToDoList[], Error>({
    queryKey: ['analysis-lists'],
    queryFn: () => listsService.getAll(),
  });

  // ── Fetch all tasks across every list ─────────────────────────────────────
  const {
    data: tasks = EMPTY_TASKS,
    isLoading: tasksLoading,
    error: tasksError,
  } = useQuery<Task[], Error>({
    queryKey: ['analysis-tasks', lists.map((l) => l.id)],
    queryFn: async () => {
      const arrays = await Promise.all(lists.map((l) => tasksService.getAll(l.id)));
      return arrays.flat();
    },
    enabled: lists.length > 0,
  });

  // ── Fetch steps for every task ─────────────────────────────────────────────
  const {
    data: stepsByTaskId = {},
    isLoading: stepsLoading,
    error: stepsError,
  } = useQuery<Record<string, Step[]>, Error>({
    queryKey: ['analysis-steps', tasks.map((t) => t.id)],
    queryFn: async () => {
      const entries = await Promise.all(
        tasks.map(async (task) => {
          const steps = await stepsService.getByTask(task.id);
          return [task.id, steps] as [string, Step[]];
        }),
      );
      return Object.fromEntries(entries);
    },
    enabled: tasks.length > 0,
  });

  // ── Retry helper ──────────────────────────────────────────────────────────
  const retry = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['analysis-lists'] });
    queryClient.invalidateQueries({ queryKey: ['analysis-tasks'] });
    queryClient.invalidateQueries({ queryKey: ['analysis-steps'] });
  }, [queryClient]);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const heatmapData = useMemo(() => deriveHeatmapData(tasks), [tasks]);
  const streak = useMemo(() => deriveStreak(tasks), [tasks]);
  const trendData = useMemo(() => deriveTrendData(tasks), [tasks]);
  const tasksByList = useMemo(() => deriveTasksByList(lists, tasks), [lists, tasks]);
  const dueDateOverview = useMemo(() => deriveDueDateOverview(tasks), [tasks]);
  const stepsProgress = useMemo(
    () => deriveStepsProgress(tasks, stepsByTaskId),
    [tasks, stepsByTaskId],
  );

  const loading = listsLoading || tasksLoading || stepsLoading;
  const error = (listsError ?? tasksError ?? stepsError) as Error | null;

  return {
    heatmapData,
    streak,
    trendData,
    tasksByList,
    dueDateOverview,
    stepsProgress,
    loading,
    error,
    retry,
  };
}
