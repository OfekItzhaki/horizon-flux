import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useQueuedMutation } from '../hooks/useQueuedMutation';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { tasksService } from '../services/tasks.service';
import { stepsService } from '../services/steps.service';
import FloatingActionButton from '../components/FloatingActionButton';
import Skeleton from '../components/Skeleton';
import ReminderConfigComponent from '../components/ReminderConfig';
import { useTranslation } from 'react-i18next';
import { useKeyboardShortcuts } from '../utils/useKeyboardShortcuts';
import { isRtlLanguage } from '@tasks-management/frontend-services';
import {
  Task,
  ApiError,
  Step,
  CreateStepDto,
  UpdateTaskDto,
  UpdateStepDto,
  ListType,
} from '@tasks-management/frontend-services';
import { handleApiError, extractErrorMessage } from '../utils/errorHandler';
import {
  ReminderConfig,
  convertBackendToReminders,
  convertRemindersToBackend,
  formatReminderDisplay,
} from '../utils/reminderHelpers';

export default function TaskDetailsPage() {
  const { t, i18n } = useTranslation();
  const isRtl = isRtlLanguage(i18n.language);
  const { taskId } = useParams<{ taskId: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const numericTaskId = taskId ? Number(taskId) : null;
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [taskDescriptionDraft, setTaskDescriptionDraft] = useState('');
  const [showAddStep, setShowAddStep] = useState(false);
  const [newStepDescription, setNewStepDescription] = useState('');
  const [editingStepId, setEditingStepId] = useState<number | null>(null);
  const [stepDescriptionDraft, setStepDescriptionDraft] = useState('');
  
  // Full edit mode state (for description, due date, reminders)
  const [isFullEditMode, setIsFullEditMode] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editReminders, setEditReminders] = useState<ReminderConfig[]>([]);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'Escape',
      handler: () => {
        if (isEditingTask) {
          setIsEditingTask(false);
          setTaskDescriptionDraft(task?.description ?? '');
        } else if (editingStepId !== null) {
          setEditingStepId(null);
          setStepDescriptionDraft('');
        } else if (showAddStep) {
          setShowAddStep(false);
          setNewStepDescription('');
        }
      },
      description: 'Cancel editing',
    },
    {
      key: 's',
      handler: () => {
        if (!showAddStep && task) {
          setShowAddStep(true);
        }
      },
      description: 'Add new step',
    },
  ]);

  // Speed-up + consistency:
  // If the user just toggled completion in the list view and immediately navigates here,
  // the network fetch may still return stale data. Use cached task from React Query first.
  const getCachedTaskById = (): Task | undefined => {
    if (typeof numericTaskId !== 'number' || Number.isNaN(numericTaskId)) {
      return undefined;
    }

    const direct = queryClient.getQueryData<Task>(['task', numericTaskId]);
    if (direct) return direct;

    const candidates = queryClient.getQueriesData<Task[]>({
      queryKey: ['tasks'],
    });
    for (const [, tasks] of candidates) {
      const found = tasks?.find((t) => t.id === numericTaskId);
      if (found) return found;
    }
    return undefined;
  };

  const {
    data: task,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Task, ApiError>({
    queryKey: ['task', numericTaskId],
    enabled: typeof numericTaskId === 'number' && !Number.isNaN(numericTaskId),
    initialData: () => getCachedTaskById(),
    queryFn: () => tasksService.getTaskById(numericTaskId as number),
  });

  useEffect(() => {
    if (task) {
      // Always sync task description draft
      setTaskDescriptionDraft(task.description);
      
      // Only update edit form when not in edit mode to avoid overwriting user changes
      if (!isFullEditMode) {
        setEditDescription(task.description);
        setEditDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
        const convertedReminders = convertBackendToReminders(
          task.reminderDaysBefore,
          task.specificDayOfWeek,
          task.dueDate || null,
        );
        setEditReminders(convertedReminders);
      }
    }
  }, [task, isFullEditMode]);

  const invalidateTask = (t: Task) => {
    // Non-blocking invalidations - don't await
    queryClient.invalidateQueries({ queryKey: ['task', t.id] });
    queryClient.invalidateQueries({ queryKey: ['tasks', t.todoListId] });
  };

  const updateTaskMutation = useQueuedMutation<
    Task,
    ApiError,
    { id: number; data: UpdateTaskDto },
    { previousTask?: Task; previousTasks?: Task[]; todoListId?: number }
  >({
    mutationFn: ({ id, data }) =>
      tasksService.updateTask(id, data),
    onMutate: ({ id, data }) => {
      // Cancel only to prevent race conditions, but don't block
      // Removed cancelQueries to allow parallel mutations

      const previousTask = queryClient.getQueryData<Task>(['task', id]);
      const todoListId = previousTask?.todoListId;

      const previousTasks =
        typeof todoListId === 'number'
          ? queryClient.getQueryData<Task[]>(['tasks', todoListId])
          : undefined;

      if (previousTask) {
        queryClient.setQueryData<Task>(['task', id], {
          ...previousTask,
          ...data,
          updatedAt: new Date().toISOString(),
        });
      }

      if (typeof todoListId === 'number' && previousTasks) {
        queryClient.setQueryData<Task[]>(['tasks', todoListId], (old = []) =>
          old.map((t) =>
            t.id === id
              ? { ...t, ...data, updatedAt: new Date().toISOString() }
              : t,
          ),
        );
      }

      return { previousTask, previousTasks, todoListId };
    },
    onError: (err, vars, ctx) => {
      if (ctx?.previousTask) {
        queryClient.setQueryData(['task', vars.id], ctx.previousTask);
      }
      if (typeof ctx?.todoListId === 'number' && ctx?.previousTasks) {
        queryClient.setQueryData(['tasks', ctx.todoListId], ctx.previousTasks);
      }
      handleApiError(err, t('taskDetails.updateTaskFailed', { defaultValue: 'Failed to update task. Please try again.' }));
    },
    onSettled: (_data, _err, vars) => {
      // Non-blocking invalidations - don't await
      queryClient.invalidateQueries({ queryKey: ['task', vars.id] });
      const current = queryClient.getQueryData<Task>(['task', vars.id]);
      if (current?.todoListId) {
        queryClient.invalidateQueries({ queryKey: ['tasks', current.todoListId] });
      }
    },
  });

  const updateStepMutation = useQueuedMutation<
    Step,
    ApiError,
    { task: Task; stepId: number; data: UpdateStepDto },
    { previousTask?: Task; previousTasks?: Task[] }
  >({
    mutationFn: ({ stepId, data }) => stepsService.updateStep(stepId, data),
    onMutate: async (vars) => {
      // Removed cancelQueries to allow parallel mutations

      const previousTask = queryClient.getQueryData<Task>(['task', vars.task.id]);
      const previousTasks = queryClient.getQueryData<Task[]>([
        'tasks',
        vars.task.todoListId,
      ]);

      const patchTaskSteps = (t: Task): Task => ({
        ...t,
        steps: (t.steps ?? []).map((s) =>
          s.id === vars.stepId ? { ...s, ...vars.data } : s,
        ),
        updatedAt: new Date().toISOString(),
      });

      if (previousTask) {
        queryClient.setQueryData<Task>(['task', vars.task.id], patchTaskSteps(previousTask));
      }

      queryClient.setQueryData<Task[]>(['tasks', vars.task.todoListId], (old = []) =>
        old.map((t) => (t.id === vars.task.id ? patchTaskSteps(t) : t)),
      );

      return { previousTask, previousTasks };
    },
    onError: (err, vars, ctx) => {
      if (ctx?.previousTask) {
        queryClient.setQueryData(['task', vars.task.id], ctx.previousTask);
      }
      if (ctx?.previousTasks) {
        queryClient.setQueryData(['tasks', vars.task.todoListId], ctx.previousTasks);
      }
      handleApiError(err, t('taskDetails.updateStepFailed', { defaultValue: 'Failed to update step. Please try again.' }));
    },
    onSettled: (_data, _err, vars) => {
      // Non-blocking invalidation - don't await
      invalidateTask(vars.task);
    },
  });

  const createStepMutation = useMutation<
    Step,
    ApiError,
    { task: Task; data: CreateStepDto },
    { previousTask?: Task }
  >({
    mutationFn: ({ task, data }) => stepsService.createStep(task.id, data),
    onMutate: async (vars) => {
      // Removed cancelQueries to allow parallel mutations

      const previousTask = queryClient.getQueryData<Task>(['task', vars.task.id]);

      const now = new Date().toISOString();
      const tempId = -Date.now();
      const optimistic: Step = {
        id: tempId,
        description: vars.data.description,
        completed: Boolean(vars.data.completed ?? false),
        taskId: vars.task.id,
        order: Date.now(),
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      };

      if (previousTask) {
        queryClient.setQueryData<Task>(['task', vars.task.id], {
          ...previousTask,
          steps: [...(previousTask.steps ?? []), optimistic],
          updatedAt: now,
        });
      }

      return { previousTask };
    },
    onError: (err, vars, ctx) => {
      if (ctx?.previousTask) {
        queryClient.setQueryData(['task', vars.task.id], ctx.previousTask);
      }
      handleApiError(err, t('taskDetails.addStepFailed', { defaultValue: 'Failed to add step. Please try again.' }));
    },
    onSuccess: (_created, vars) => {
      setNewStepDescription('');
      setShowAddStep(false);
      toast.success(t('taskDetails.stepAdded'));
      // ensure list view reflects steps count if needed
      queryClient.invalidateQueries({ queryKey: ['tasks', vars.task.todoListId] });
    },
    onSettled: (_data, _err, vars) => {
      // Non-blocking invalidation - don't await
      invalidateTask(vars.task);
    },
  });

  const deleteStepMutation = useQueuedMutation<
    Step,
    ApiError,
    { task: Task; id: number },
    { previousTask?: Task }
  >({
    mutationFn: ({ id }) => stepsService.deleteStep(id),
    onMutate: async (vars) => {
      // Removed cancelQueries to allow parallel mutations
      const previousTask = queryClient.getQueryData<Task>(['task', vars.task.id]);

      if (previousTask) {
        queryClient.setQueryData<Task>(['task', vars.task.id], {
          ...previousTask,
          steps: (previousTask.steps ?? []).filter((s) => s.id !== vars.id),
          updatedAt: new Date().toISOString(),
        });
      }

      return { previousTask };
    },
    onError: (err, vars, ctx) => {
      if (ctx?.previousTask) {
        queryClient.setQueryData(['task', vars.task.id], ctx.previousTask);
      }
      handleApiError(err, t('taskDetails.deleteStepFailed', { defaultValue: 'Failed to delete step. Please try again.' }));
    },
    onSuccess: () => {
      toast.success(t('taskDetails.stepDeleted'));
    },
    onSettled: (_data, _err, vars) => {
      // Non-blocking invalidation - don't await
      invalidateTask(vars.task);
    },
  });

  const safeTaskId =
    typeof numericTaskId === 'number' && !Number.isNaN(numericTaskId)
      ? numericTaskId
      : null;

  const restoreTaskMutation = useQueuedMutation<Task, ApiError, { id: number }>({
    mutationFn: ({ id }) => tasksService.restoreTask(id),
    onError: (err) => {
      handleApiError(err, t('tasks.restoreFailed', { defaultValue: 'Failed to restore task. Please try again.' }));
    },
    onSuccess: (restored) => {
      toast.success(t('tasks.restored'));

      // Non-blocking invalidations - don't await
      if (typeof safeTaskId === 'number') {
        queryClient.invalidateQueries({ queryKey: ['task', safeTaskId] });
      }
      if (typeof restored.todoListId === 'number') {
        queryClient.invalidateQueries({
          queryKey: ['tasks', restored.todoListId],
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }

      // Navigate to the list the task returned to.
      if (typeof restored.todoListId === 'number') {
        navigate(`/lists/${restored.todoListId}/tasks`);
      } else {
        navigate('/lists');
      }
    },
  });

  const permanentDeleteTaskMutation = useQueuedMutation<Task, ApiError, { id: number }>({
    mutationFn: ({ id }) => tasksService.permanentDeleteTask(id),
    onError: (err) => {
      handleApiError(err, t('tasks.deleteForeverFailed', { defaultValue: 'Failed to permanently delete task. Please try again.' }));
    },
    onSuccess: () => {
      toast.success(t('tasks.deletedForever'));

      // Non-blocking invalidations - don't await
      if (typeof safeTaskId === 'number') {
        queryClient.invalidateQueries({ queryKey: ['task', safeTaskId] });
      }
      queryClient.invalidateQueries({ queryKey: ['tasks'] });

      navigate('/lists');
    },
  });

  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="bg-white dark:bg-[#1f1f1f] rounded-lg shadow p-6">
          <div className={`flex ${isRtl ? 'flex-row-reverse' : ''} items-start justify-between gap-3 mb-4`}>
            <div className={`flex items-center ${isRtl ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-7 w-72" />
            </div>
            <Skeleton className="h-9 w-44" />
          </div>
          <Skeleton className="h-4 w-40" />
          <div className="mt-6">
            <Skeleton className="h-6 w-24" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`flex ${isRtl ? 'flex-row-reverse' : ''} items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded`}>
                  <div className={`flex items-center ${isRtl ? 'space-x-reverse space-x-3' : 'gap-3'} min-w-0 flex-1`}>
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
        <div className="text-sm text-red-800 dark:text-red-200 mb-3">
          {isError
            ? extractErrorMessage(error, t('taskDetails.loadFailed', { defaultValue: 'Failed to load task. Please try again.' }))
            : t('taskDetails.notFound')}
        </div>
        <div className="flex gap-3">
          {isError && (
            <button
              onClick={() => refetch()}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
            >
              {t('common.retry') || 'Retry'}
            </button>
          )}
          <Link
            to="/lists"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            {t('tasks.backToLists')}
          </Link>
        </div>
      </div>
    );
  }

  const isArchivedTask = task.todoList?.type === ListType.FINISHED;

  return (
    <div>
      <div className="mb-6">
        <Link
          to={task.todoListId ? `/lists/${task.todoListId}/tasks` : '/lists'}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium"
        >
          {t('taskDetails.backToTasks')}
        </Link>
      </div>

      <div className="premium-card p-6">
        <div className={`flex items-start justify-between gap-3 mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center ${isRtl ? 'space-x-reverse space-x-3' : 'space-x-3'} flex-1`}>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => {
              updateTaskMutation.mutate({
                id: task.id,
                data: { completed: !task.completed },
              });
            }}
            className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
          />
            {isEditingTask ? (
              <div className="flex flex-col gap-2">
                <input
                  value={taskDescriptionDraft}
                  onChange={(e) => setTaskDescriptionDraft(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={!taskDescriptionDraft.trim()}
                    onClick={() => {
                      updateTaskMutation.mutate(
                        {
                          id: task.id,
                          data: { description: taskDescriptionDraft.trim() },
                        },
                        {
                          onSuccess: () => {
                            toast.success(t('taskDetails.taskUpdated'));
                            setIsEditingTask(false);
                          },
                        },
                      );
                    }}
                    className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('common.save')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingTask(false);
                      setTaskDescriptionDraft(task.description);
                    }}
                    className="inline-flex justify-center rounded-md bg-gray-100 dark:bg-[#2a2a2a] px-3 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-[#333333]"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <h1
                className="premium-header-section text-2xl cursor-text"
                title={t('taskDetails.clickToEdit')}
                onClick={() => {
                  if (isArchivedTask) return;
                  setIsEditingTask(true);
                  setTaskDescriptionDraft(task.description);
                }}
              >
                {task.description}
              </h1>
            )}
          </div>
          {!isArchivedTask && (
            <button
              onClick={() => setIsFullEditMode(true)}
              className="glass-button text-sm font-medium"
            >
              {t('common.edit', { defaultValue: 'Edit' })}
            </button>
          )}
          {isArchivedTask && (
            <div className={`flex gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <button
                type="button"
                disabled={false}
                onClick={() => {
                  const ok = window.confirm(
                    t('tasks.restoreConfirm', { description: task.description }),
                  );
                  if (!ok) return;
                  restoreTaskMutation.mutate({ id: task.id });
                }}
                className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('tasks.restore')}
              </button>
              <button
                type="button"
                disabled={false}
                onClick={() => {
                  const ok = window.confirm(
                    t('tasks.deleteForeverConfirm', { description: task.description }),
                  );
                  if (!ok) return;
                  permanentDeleteTaskMutation.mutate({ id: task.id });
                }}
                className="inline-flex justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('tasks.deleteForever')}
              </button>
            </div>
          )}
        </div>

        {/* Task Info Display (when not in full edit mode) */}
        {!isFullEditMode && (
          <>
            {/* Due Date */}
            {task.dueDate && (
              <div className="mb-6">
                <div className="premium-card p-4">
                  <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <span className="text-lg">📅</span>
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        {t('taskDetails.dueDate', { defaultValue: 'Due Date' })}
                      </div>
                      <div className="text-base font-medium text-gray-900 dark:text-white">
                        {new Date(task.dueDate).toLocaleDateString(i18n.language === 'he' ? 'he-IL' : 'en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reminders */}
            {(() => {
              // Check if task has any reminder data
              const hasReminderData = 
                (task.reminderDaysBefore && Array.isArray(task.reminderDaysBefore) && task.reminderDaysBefore.length > 0) ||
                (task.specificDayOfWeek !== null && task.specificDayOfWeek !== undefined && task.specificDayOfWeek >= 0 && task.specificDayOfWeek <= 6);
              
              if (!hasReminderData) {
                return null;
              }

              const reminders = convertBackendToReminders(
                task.reminderDaysBefore,
                task.specificDayOfWeek,
                task.dueDate || null,
              );

              if (reminders.length === 0) {
                // If we have reminder data but conversion returned empty, show debug info
                return (
                  <div className="mb-6">
                    <h3 className="premium-header-section text-lg mb-4">
                      {t('reminders.title', { defaultValue: 'Reminders' })}
                    </h3>
                    <div className="premium-card p-4 text-sm text-gray-500 dark:text-gray-400">
                      <div>Reminder data exists but couldn't be converted.</div>
                      <div className="text-xs mt-2 opacity-75">
                        reminderDaysBefore: {JSON.stringify(task.reminderDaysBefore)}, 
                        specificDayOfWeek: {String(task.specificDayOfWeek)},
                        dueDate: {task.dueDate ? 'set' : 'not set'}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div className="mb-6">
                  <h3 className="premium-header-section text-lg mb-4">
                    {t('reminders.title', { defaultValue: 'Reminders' })}
                  </h3>
                  <div className="space-y-3">
                    {reminders.map((reminder, idx) => (
                      <div 
                        key={idx} 
                        className="premium-card p-4"
                      >
                        <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                          <span className="text-xl">
                            {reminder.hasAlarm ? '🔔' : '⏰'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatReminderDisplay(reminder, t)}
                            </div>
                            {reminder.hasAlarm && (
                              <div className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                                {t('reminders.alarmOn', { defaultValue: 'Alarm enabled' })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </>
        )}

        {/* Full Edit Form */}
        {isFullEditMode && (
          <div className="premium-card p-6 mb-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('taskDetails.form.descriptionLabel')}
              </label>
              <input
                type="text"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="premium-input w-full"
                placeholder={t('taskDetails.form.descriptionPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('taskDetails.dueDate', { defaultValue: 'Due Date' })}
              </label>
              <input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="premium-input w-full"
              />
            </div>

            <ReminderConfigComponent
              reminders={editReminders}
              onRemindersChange={(newReminders) => {
                // Update local state immediately for instant UI feedback
                setEditReminders(newReminders);
                
                // Auto-save reminders in background when they change
                if (task) {
                  const updateData: UpdateTaskDto = {};
                  
                  // Use editDueDate if set, otherwise use task's dueDate
                  const dueDateForConversion = editDueDate.trim()
                    ? new Date(editDueDate).toISOString()
                    : (task.dueDate || undefined);
                  
                  const reminderData = convertRemindersToBackend(newReminders, dueDateForConversion);
                  
                  // Always set these fields explicitly
                  updateData.reminderDaysBefore = reminderData.reminderDaysBefore || [];
                  updateData.specificDayOfWeek = reminderData.specificDayOfWeek !== undefined 
                    ? reminderData.specificDayOfWeek 
                    : null;

                  // Save in background without blocking UI
                  updateTaskMutation.mutate(
                    { id: task.id, data: updateData },
                    {
                      onSuccess: (updatedTask) => {
                        // Update the task query data immediately with the saved reminders
                        queryClient.setQueryData<Task>(['task', task.id], (old) => {
                          if (!old) return old;
                          return {
                            ...old,
                            reminderDaysBefore: updatedTask.reminderDaysBefore || [],
                            specificDayOfWeek: updatedTask.specificDayOfWeek ?? null,
                            dueDate: updatedTask.dueDate ?? old.dueDate,
                          };
                        });
                        
                        // Also invalidate to ensure fresh data
                        queryClient.invalidateQueries({ queryKey: ['task', task.id] });
                        queryClient.invalidateQueries({ queryKey: ['tasks', task.todoListId] });
                      },
                      onError: (error) => {
                        // Show error only if save fails
                        handleApiError(error, t('taskDetails.updateTaskFailed', { defaultValue: 'Failed to save reminders' }));
                        // Revert to previous state on error
                        const previousReminders = convertBackendToReminders(
                          task.reminderDaysBefore,
                          task.specificDayOfWeek,
                          task.dueDate || null,
                        );
                        setEditReminders(previousReminders);
                      },
                    }
                  );
                }
              }}
            />

            <div className={`flex gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={() => {
                  setIsFullEditMode(false);
                  if (task) {
                    setEditDescription(task.description);
                    setEditDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
                    const convertedReminders = convertBackendToReminders(
                      task.reminderDaysBefore,
                      task.specificDayOfWeek,
                      task.dueDate || null,
                    );
                    setEditReminders(convertedReminders);
                  }
                }}
                className="flex-1 glass-button"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => {
                  if (!editDescription.trim()) {
                    toast.error(t('taskDetails.descriptionRequired', { defaultValue: 'Description is required' }));
                    return;
                  }

                  const updateData: UpdateTaskDto = {
                    description: editDescription.trim(),
                  };

                  if (editDueDate.trim()) {
                    const date = new Date(editDueDate);
                    if (!isNaN(date.getTime())) {
                      updateData.dueDate = date.toISOString();
                    }
                  } else {
                    updateData.dueDate = null;
                  }

                  const dueDateForConversion = updateData.dueDate || (task?.dueDate || undefined);
                  const reminderData = convertRemindersToBackend(editReminders, dueDateForConversion);
                  
                  updateData.reminderDaysBefore = reminderData.reminderDaysBefore || [];
                  updateData.specificDayOfWeek = reminderData.specificDayOfWeek !== undefined 
                    ? reminderData.specificDayOfWeek 
                    : null;

                  // Close edit mode immediately, save in background
                  setIsFullEditMode(false);
                  
                  updateTaskMutation.mutate(
                    { id: task.id, data: updateData },
                    {
                      onSuccess: () => {
                        toast.success(t('taskDetails.taskUpdated'));
                      },
                    }
                  );
                }}
                disabled={updateTaskMutation.isPending || !editDescription.trim()}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateTaskMutation.isPending ? t('common.loading') : t('common.save')}
              </button>
            </div>
          </div>
        )}

        <div className="mt-6">
          <div className={`flex ${isRtl ? 'flex-row-reverse' : ''} items-center justify-between gap-3 mb-3`}>
            <h2 className="premium-header-section text-lg">
              {t('taskDetails.stepsTitle')}
            </h2>
          </div>

          {showAddStep && (
            <form
              className="bg-white dark:bg-[#1a1a1a] rounded-lg border border-gray-200 dark:border-[#2a2a2a] p-4 mb-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!newStepDescription.trim()) return;
                createStepMutation.mutate({
                  task,
                  data: { description: newStepDescription.trim() },
                });
              }}
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-end">
                <div className="sm:col-span-10">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('taskDetails.form.descriptionLabel')}
                  </label>
                  <input
                    value={newStepDescription}
                    onChange={(e) => setNewStepDescription(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder={t('taskDetails.form.descriptionPlaceholder')}
                  />
                </div>
                <div className="sm:col-span-2 flex gap-2">
                  <button
                    type="submit"
                    disabled={createStepMutation.isPending || !newStepDescription.trim()}
                    className="inline-flex flex-1 justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createStepMutation.isPending
                      ? t('common.loading')
                      : t('common.create')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddStep(false);
                      setNewStepDescription('');
                    }}
                    className="inline-flex justify-center rounded-md bg-gray-100 dark:bg-[#2a2a2a] px-3 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-[#333333]"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            </form>
          )}

          {task.steps && task.steps.length > 0 ? (
            <ul className="space-y-2">
              {task.steps.map((step) => (
                <li
                  key={step.id}
                  className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={step.completed}
                      onChange={() => {
                        updateStepMutation.mutate({
                          task,
                          stepId: step.id,
                          data: { completed: !step.completed },
                        });
                      }}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    {editingStepId === step.id ? (
                      <input
                        value={stepDescriptionDraft}
                        onChange={(e) => setStepDescriptionDraft(e.target.value)}
                        className="min-w-0 flex-1 rounded-md border border-gray-300 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    ) : (
                      <span
                        className={
                          step.completed
                            ? 'line-through text-gray-500 dark:text-gray-400 truncate'
                            : 'text-gray-900 dark:text-white truncate'
                        }
                        title={t('taskDetails.clickToEdit')}
                        onClick={() => {
                          setEditingStepId(step.id);
                          setStepDescriptionDraft(step.description);
                        }}
                      >
                        {step.description}
                      </span>
                    )}
                  </div>

                  {editingStepId === step.id ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={!stepDescriptionDraft.trim()}
                        onClick={() => {
                          updateStepMutation.mutate(
                            {
                              task,
                              stepId: step.id,
                              data: { description: stepDescriptionDraft.trim() },
                            },
                            {
                              onSuccess: () => {
                                toast.success(t('taskDetails.stepUpdated'));
                                setEditingStepId(null);
                                setStepDescriptionDraft('');
                              },
                            },
                          );
                        }}
                        className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t('common.save')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingStepId(null);
                          setStepDescriptionDraft('');
                        }}
                        className="inline-flex justify-center rounded-md bg-gray-200 dark:bg-[#2a2a2a] px-3 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-[#333333]"
                      >
                        {t('common.cancel')}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={false}
                      onClick={() => {
                        const ok = window.confirm(
                          t('taskDetails.deleteStepConfirm', { description: step.description }),
                        );
                        if (!ok) return;
                        deleteStepMutation.mutate({ task, id: step.id });
                      }}
                      className="inline-flex justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('common.delete')}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('taskDetails.noSteps')}</p>
          )}
        </div>
      </div>

      <FloatingActionButton
        ariaLabel={t('taskDetails.addStepFab')}
        onClick={() => setShowAddStep(true)}
      />
    </div>
  );
}
