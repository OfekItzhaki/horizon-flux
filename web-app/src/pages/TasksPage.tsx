import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { useTasksData } from '../hooks/useTasksData';
import { useKeyboardShortcuts } from '../utils/useKeyboardShortcuts';
import { isRtlLanguage } from '@tasks-management/frontend-services';
import {
  Task,
  ListType,
} from '@tasks-management/frontend-services';

import TasksListHeader from '../components/task/TasksListHeader';
import TasksListTitle from '../components/task/TasksListTitle';
import CreateTaskForm from '../components/task/CreateTaskForm';
import BulkActionsBar from '../components/task/BulkActionsBar';
import { SortableTaskItem } from '../components/SortableTaskItem';
import Pagination from '../components/Pagination';
import Skeleton from '../components/Skeleton';
import FloatingActionButton from '../components/FloatingActionButton';
import { extractErrorMessage } from '../utils/errorHandler';

const EMPTY_TASKS: Task[] = [];

export default function TasksPage() {
  const { t, i18n } = useTranslation();
  const isRtl = isRtlLanguage(i18n.language);
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();

  // State
  const [showCreate, setShowCreate] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [tasksOrder, setTasksOrder] = useState<Task[]>(EMPTY_TASKS);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const numericListId = useMemo(() => (listId ? Number(listId) : null), [listId]);

  // Data hook
  const {
    list,
    tasks = EMPTY_TASKS,
    isLoading,
    isError,
    error,
    refetchTasks,
    updateList,
    deleteList,
    createTask,
    deleteTask,
    restoreTask,
    permanentDeleteTask,
    updateTask,
    reorderTasks,
  } = useTasksData(numericListId);

  const isFinishedList = list?.type === ListType.FINISHED;

  // Effects
  useEffect(() => {
    if (tasks.length > 0) {
      const sorted = [...tasks].sort((a, b) => a.order - b.order);
      setTasksOrder(sorted);
    } else {
      setTasksOrder(EMPTY_TASKS);
    }
    setCurrentPage(1);
  }, [tasks]);

  // Pagination
  const totalPages = Math.ceil(tasksOrder.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTasks = tasksOrder.slice(startIndex, startIndex + itemsPerPage);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Handlers
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || isBulkMode || isFinishedList) return;

    const oldIndex = tasksOrder.findIndex((task) => task.id === active.id);
    const newIndex = tasksOrder.findIndex((task) => task.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = arrayMove(tasksOrder, oldIndex, newIndex);
      setTasksOrder(newOrder);
      reorderTasks({ taskIds: newOrder.map((task) => task.id) });
    }
  }, [tasksOrder, isBulkMode, isFinishedList, reorderTasks]);

  const toggleBulkMode = useCallback(() => {
    if (isFinishedList) return;
    setIsBulkMode(prev => !prev);
    setSelectedTasks(new Set());
  }, [isFinishedList]);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'n',
      handler: () => { if (!showCreate && !isFinishedList && numericListId) setShowCreate(true); },
      description: 'Create new task',
    },
    {
      key: 'Escape',
      handler: () => {
        if (showCreate) {
          setShowCreate(false);
        } else if (isBulkMode) {
          setIsBulkMode(false);
          setSelectedTasks(new Set());
        }
      },
      description: 'Cancel current action',
    },
    {
      key: 'b',
      handler: toggleBulkMode,
      description: 'Toggle bulk mode',
    },
  ]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <div className="flex justify-between items-center"><Skeleton className="h-12 w-64" /><Skeleton className="h-10 w-24" /></div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-6 text-center">
        <p className="text-red-800 dark:text-red-200 mb-4">{extractErrorMessage(error, t('tasks.loadFailed'))}</p>
        <button onClick={() => refetchTasks()} className="premium-button bg-red-600">
          {t('common.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <TasksListHeader
        isRtl={isRtl}
        list={list}
        isBulkMode={isBulkMode}
        isPendingDelete={false}
        onDeleteList={(id) => deleteList({ id })}
      />

      <div className="flex flex-col items-center justify-center mb-8 gap-6">
        {isBulkMode && (
          <BulkActionsBar
            isRtl={isRtl}
            selectedCount={selectedTasks.size}
            allTasks={tasks}
            selectedTasks={selectedTasks}
            isFinishedList={isFinishedList}
            onToggleSelectAll={() => {
              const allSelected = tasks.every((t) => selectedTasks.has(t.id));
              setSelectedTasks(allSelected ? new Set() : new Set(tasks.map((t) => t.id)));
            }}
            onMarkComplete={() => {
              selectedTasks.forEach(id => updateTask({ id, data: { completed: true } }));
              setSelectedTasks(new Set());
            }}
            onMarkIncomplete={() => {
              selectedTasks.forEach(id => updateTask({ id, data: { completed: false } }));
              setSelectedTasks(new Set());
            }}
            onDeleteSelected={() => {
              if (window.confirm(t('tasks.deleteSelectedConfirm', { count: selectedTasks.size }))) {
                selectedTasks.forEach(id => deleteTask({ id }));
                setSelectedTasks(new Set());
              }
            }}
          />
        )}

        <TasksListTitle list={list} isRtl={isRtl} onUpdateList={(id, data) => updateList({ id, data })} />
      </div>

      {showCreate && (
        <CreateTaskForm
          isRtl={isRtl}
          isPending={false}
          isFinishedList={isFinishedList}
          onCreateTask={(data) => {
            createTask(data);
            setShowCreate(false);
          }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={paginatedTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4 relative">
            {paginatedTasks.length > 0 && (
              <button
                onClick={toggleBulkMode}
                className={`group absolute ${isRtl ? 'right-0' : 'left-0'} -top-12 z-10 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r ${isBulkMode ? 'from-red-600 to-red-700' : 'from-primary-600 to-purple-600'} text-white shadow-glow transition-all hover:scale-110`}
              >
                {isBulkMode ? '✕' : '✓'}
              </button>
            )}

            {paginatedTasks.map((task) => (
              <SortableTaskItem
                key={task.id}
                task={task}
                isBulkMode={isBulkMode}
                isSelected={selectedTasks.has(task.id)}
                isFinishedList={isFinishedList}
                isRtl={isRtl}
                onToggleSelect={() => {
                  const next = new Set(selectedTasks);
                  if (next.has(task.id)) next.delete(task.id); else next.add(task.id);
                  setSelectedTasks(next);
                }}
                onToggleComplete={() => updateTask({ id: task.id, data: { completed: !task.completed } })}
                onDelete={() => {
                  if (window.confirm(t('tasks.deleteTaskConfirm', { description: task.description }))) {
                    deleteTask({ id: task.id });
                  }
                }}
                onRestore={() => {
                  if (window.confirm(t('tasks.restoreConfirm', { description: task.description }))) {
                    restoreTask({ id: task.id });
                  }
                }}
                onPermanentDelete={() => {
                  if (window.confirm(t('tasks.deleteForeverConfirm', { description: task.description }))) {
                    permanentDeleteTask({ id: task.id });
                  }
                }}
                onClick={() => isBulkMode ? null : navigate(`/tasks/${task.id}`)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {tasksOrder.length > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={tasksOrder.length}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}

      {tasks.length === 0 && (
        <div className="text-center py-16 opacity-60">
          <p className="text-lg">{t('tasks.empty', { defaultValue: 'No tasks here yet' })}</p>
        </div>
      )}

      <FloatingActionButton
        ariaLabel={t('tasks.createFab')}
        disabled={!numericListId || isFinishedList}
        onClick={() => setShowCreate(true)}
      />
    </div>
  );
}
