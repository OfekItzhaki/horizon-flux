import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { listsService } from '../services/lists.service';
import { tasksService } from '../services/tasks.service';
import { ToDoList, Task, ListType } from '../types';
import {
    calculateDailyCompletions,
    calculateStreak,
    calculateTrendData,
    calculateStats,
} from '@tasks-management/frontend-services';

const EMPTY_LISTS: ToDoList[] = [];
const EMPTY_TASKS: Task[] = [];

export function useAnalysisData() {
    const { i18n } = useTranslation();

    const {
        data: allLists = EMPTY_LISTS,
        isLoading: listsLoading,
        isError: listsError,
        error: listsErrorObj,
        refetch: refetchLists,
    } = useQuery<ToDoList[]>({
        queryKey: ['lists'],
        queryFn: () => listsService.getAll(),
    });

    // Filter out system lists that shouldn't be in analytics (Trash, Done)
    // Note: Done is a system list but might be useful for some stats,
    // but usually we want to see active tasks vs completed ones across lists.
    const lists = useMemo(() => {
        return allLists.filter((l) => l.type !== ListType.TRASH && l.type !== ListType.DONE);
    }, [allLists]);

    const {
        data: allTasks = EMPTY_TASKS,
        isLoading: tasksLoading,
        isError: tasksError,
        error: tasksErrorObj,
        refetch: refetchTasks,
    } = useQuery<Task[]>({
        queryKey: ['all-tasks'],
        queryFn: async () => {
            const tasksPromises = lists.map((list) =>
                tasksService.getAll(list.id)
            );
            const tasksArrays = await Promise.all(tasksPromises);
            return tasksArrays.flat();
        },
        enabled: lists.length > 0,
    });

    const isLoading = listsLoading || tasksLoading;
    const hasError = listsError || tasksError;

    const stats = useMemo(
        () => calculateStats(allTasks as any, lists as any),
        [allTasks, lists]
    );
    const dailyCompletions = useMemo(
        () => calculateDailyCompletions(allTasks as any),
        [allTasks]
    );
    const dailyTrends = useMemo(
        () => calculateTrendData(allTasks as any, i18n.language),
        [allTasks, i18n.language]
    );

    const currentStreak = useMemo(() => {
        const dailyList = lists.find((list) => list.type === ListType.DAILY);
        const dailyTasks = dailyList
            ? allTasks.filter((task) => task.todoListId === dailyList.id)
            : [];
        return calculateStreak(dailyTasks as any);
    }, [lists, allTasks]);

    return {
        lists,
        allTasks,
        isLoading,
        hasError,
        listsError,
        tasksError,
        listsErrorObj,
        tasksErrorObj,
        refetchLists,
        refetchTasks,
        stats,
        dailyCompletions,
        dailyTrends,
        currentStreak,
    };
}
