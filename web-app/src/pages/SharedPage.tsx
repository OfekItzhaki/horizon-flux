import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    TaskShare,
    ApiError,
    taskSharingService,
    sharingService,
    ToDoList,
} from '@tasks-management/frontend-services';

export default function SharedPage() {
    const { user } = useAuth();

    const { data: sharedTasks = [], isLoading: isLoadingTasks } = useQuery<TaskShare[], ApiError>({
        queryKey: ['sharedTasks'],
        queryFn: () => taskSharingService.getTasksSharedWithMe(),
    });

    const { data: sharedLists = [], isLoading: isLoadingLists } = useQuery<ToDoList[], ApiError>({
        queryKey: ['sharedLists', user?.id],
        queryFn: () => user ? sharingService.getSharedLists(user.id) : Promise.resolve([]),
        enabled: !!user,
    });

    const isLoading = isLoadingTasks || isLoadingLists;

    // Filter tasks that are NOT part of a shared list (orphans)
    const sharedListIds = new Set(sharedLists.map(l => l.id));
    const orphanTasks = sharedTasks.filter(share => !sharedListIds.has(share.task?.todoListId || ''));

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                </div>
            </div>
        );
    }

    if (sharedTasks.length === 0 && sharedLists.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center py-16">
                    <h2 className="text-2xl font-bold text-primary mb-4">No Shared Content</h2>
                    <p className="text-tertiary">
                        Tasks shared with you will appear here.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-black mb-12 bg-gradient-to-r from-accent to-accent/60 bg-clip-text text-transparent">
                Shared with Me
            </h1>

            {/* Shared Lists Section */}
            {sharedLists.length > 0 && (
                <div className="mb-12">
                    <h2 className="text-sm font-bold text-tertiary uppercase tracking-wider mb-4 px-1">
                        Shared Lists
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sharedLists.map((list) => (
                            <div key={list.id} className="premium-card p-6">
                                <Link
                                    to={`/lists/${list.id}/tasks`}
                                    className="block group"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-lg font-bold text-primary group-hover:text-accent transition-colors">
                                            {list.name}
                                        </h3>
                                        <span className="text-xs text-secondary bg-surface px-2 py-1 rounded border border-border-subtle group-hover:border-accent transition-colors">
                                            View List
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-tertiary">
                                        <span>Owned by {list.owner?.name || list.owner?.email.split('@')[0]}</span>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Individual Shared Tasks Section */}
            {orphanTasks.length > 0 && (
                <div>
                    <h2 className="text-sm font-bold text-tertiary uppercase tracking-wider mb-4 px-1">
                        Individual Shared Tasks
                    </h2>
                    <div className="space-y-4">
                        {Object.entries(
                            orphanTasks
                                .filter((share) => share.task)
                                .reduce((acc, share) => {
                                    const listName = share.task!.todoList?.name || 'Other Tasks';
                                    if (!acc[listName]) acc[listName] = [];
                                    acc[listName].push(share);
                                    return acc;
                                }, {} as Record<string, TaskShare[]>)
                        ).map(([listName, tasks]) => {
                            const listId = tasks[0]?.task?.todoListId;

                            return (
                                <div key={listName} className="premium-card p-6">
                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold text-primary">
                                            From: {listName}
                                        </h3>
                                    </div>

                                    <div className="space-y-2">
                                        {tasks.map((share) => (
                                            <Link
                                                key={share.task!.id}
                                                to={listId ? `/lists/${listId}/tasks?taskId=${share.task!.id}` : '#'}
                                                className="block p-3 rounded-lg bg-hover border border-border-subtle hover:border-accent transition-all cursor-pointer"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-primary">{share.task!.description}</span>
                                                    <span className="text-xs text-tertiary uppercase px-2 py-1 bg-surface rounded">
                                                        {share.role}
                                                    </span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
