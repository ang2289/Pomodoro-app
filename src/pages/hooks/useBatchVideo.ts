import { useCallback, useMemo, useState } from "react";

export type BatchTask = {
  id: string;
  title: string;
  status?: "idle" | "queued" | "running" | "success" | "error";
  progress?: number;
  videoUrl?: string;
  message?: string;
};

type BatchStats = {
  total: number;
  queued: number;
  running: number;
  success: number;
  error: number;
  finished: number;
};

type BatchTaskInput = BatchTask[] | { tasks?: BatchTask[]; items?: BatchTask[] } | null | undefined;

function normalizeTasks(input: BatchTaskInput): BatchTask[] {
  if (Array.isArray(input)) return input;
  if (input && Array.isArray(input.tasks)) return input.tasks;
  if (input && Array.isArray(input.items)) return input.items;
  return [];
}

export function useBatchVideo(initialTasks: BatchTaskInput = []) {
  const [tasksState, rawSetTasks] = useState<BatchTask[]>(() => normalizeTasks(initialTasks));

  const tasks = useMemo(() => normalizeTasks(tasksState), [tasksState]);

  const setTasks = useCallback(
    (
      value:
        | BatchTask[]
        | ((prev: BatchTask[]) => BatchTask[])
        | { tasks?: BatchTask[]; items?: BatchTask[] }
        | null
        | undefined,
    ) => {
      rawSetTasks((prev) => {
        const safePrev = normalizeTasks(prev);
        const nextValue = typeof value === "function" ? value(safePrev) : value;
        return normalizeTasks(nextValue);
      });
    },
    [],
  );

  const stats = useMemo<BatchStats>(() => {
    return {
      total: tasks.length,
      queued: tasks.filter((task) => task.status === "queued").length,
      running: tasks.filter((task) => task.status === "running").length,
      success: tasks.filter((task) => task.status === "success").length,
      error: tasks.filter((task) => task.status === "error").length,
      finished: tasks.filter((task) => task.status === "success" || task.status === "error").length,
    };
  }, [tasks]);

  const resetTasks = useCallback(() => {
    rawSetTasks([]);
  }, []);

  return {
    tasks,
    setTasks,
    stats,
    resetTasks,
  };
}
