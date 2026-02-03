import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { listsService } from '../services/lists.service';
import { tasksService } from '../services/tasks.service';
import {
  ToDoList,
  ApiError,
  ListType,
} from '@tasks-management/frontend-services';
import { formatApiError } from '../utils/formatApiError';
import FloatingActionButton from '../components/FloatingActionButton';
import Skeleton from '../components/Skeleton';
import { useTranslation } from 'react-i18next';

export default function ListsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newListName, setNewListName] = useState('');

  const {
    data: lists = [],
    isLoading,
    isError,
    error,
  } = useQuery<ToDoList[], ApiError>({
    queryKey: ['lists'],
    queryFn: () => listsService.getAllLists(),
  });

  const createListMutation = useMutation<
    ToDoList,
    ApiError,
    { name: string },
    { previousLists?: ToDoList[] }
  >({
    mutationFn: (data) => listsService.createList(data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ['lists'] });

      const previousLists = queryClient.getQueryData<ToDoList[]>(['lists']);
      const now = new Date().toISOString();
      const tempId = -Date.now();

      const optimistic: ToDoList = {
        id: tempId,
        name: data.name,
        ownerId: 0,
        order: Date.now(),
        // User-created lists are always CUSTOM (type is an internal backend detail).
        type: ListType.CUSTOM,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        tasks: [],
      };

      queryClient.setQueryData<ToDoList[]>(['lists'], (old = []) => [
        optimistic,
        ...old,
      ]);

      return { previousLists };
    },
    onError: (err, _data, ctx) => {
      if (ctx?.previousLists) {
        queryClient.setQueryData(['lists'], ctx.previousLists);
      }
      toast.error(formatApiError(err, t('lists.createFailed')));
    },
    onSuccess: () => {
      setNewListName('');
      setShowCreate(false);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6 gap-3">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-6 bg-white rounded-lg shadow">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-3 h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-800">
          {formatApiError(error, t('lists.loadFailed'))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-center items-center mb-8">
        <h1 className="premium-header-main text-center">{t('lists.title')}</h1>
      </div>

      {showCreate && (
        <form
          className="premium-card p-6 mb-8 animate-scale-in"
          onSubmit={(e) => {
            e.preventDefault();
            if (!newListName.trim()) return;
            createListMutation.mutate({
              name: newListName.trim(),
            });
          }}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-end">
            <div className="sm:col-span-10">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1">
                {t('lists.form.nameLabel')}
              </label>
              <input
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                placeholder={t('lists.form.namePlaceholder')}
              />
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <button
                type="submit"
                disabled={createListMutation.isPending || !newListName.trim()}
                className="inline-flex flex-1 justify-center items-center rounded-xl bg-primary-600 px-4 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
              >
                {createListMutation.isPending
                  ? t('common.loading')
                  : t('common.create')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreate(false);
                  setNewListName('');
                }}
                className="inline-flex justify-center items-center rounded-xl bg-gray-100 dark:bg-[#2a2a2a] px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-[#333] transition-all hover:scale-105 active:scale-95"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">{t('lists.form.tip')}</p>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lists.map((list) => (
          <Link
            key={list.id}
            to={`/lists/${list.id}/tasks`}
            onMouseEnter={() => {
              // Prefetch tasks + list details for snappy navigation.
              void queryClient.prefetchQuery({
                queryKey: ['tasks', list.id],
                queryFn: () => tasksService.getTasksByList(list.id),
              });
              void queryClient.prefetchQuery({
                queryKey: ['list', list.id],
                queryFn: () => listsService.getListById(list.id),
              });
            }}
            onFocus={() => {
              // Keyboard navigation
              void queryClient.prefetchQuery({
                queryKey: ['tasks', list.id],
                queryFn: () => tasksService.getTasksByList(list.id),
              });
              void queryClient.prefetchQuery({
                queryKey: ['list', list.id],
                queryFn: () => listsService.getListById(list.id),
              });
            }}
            onPointerDown={() => {
              // Touch devices (no hover)
              void queryClient.prefetchQuery({
                queryKey: ['tasks', list.id],
                queryFn: () => tasksService.getTasksByList(list.id),
              });
              void queryClient.prefetchQuery({
                queryKey: ['list', list.id],
                queryFn: () => listsService.getListById(list.id),
              });
            }}
            className="block premium-card p-8 hover:scale-[1.02] active:scale-[0.98] transition-all text-center group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary-500/5 group-hover:to-primary-500/10 transition-colors" />
            <h3 className="text-lg font-black text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors break-words">
              {list.name}
            </h3>
            <div className="mt-4 flex justify-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {t('common.open')}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {lists.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">{t('lists.empty')}</p>
        </div>
      )}

      <FloatingActionButton
        ariaLabel={t('lists.createFab')}
        onClick={() => setShowCreate(true)}
      />
    </div>
  );
}
