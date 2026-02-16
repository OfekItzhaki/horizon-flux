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

    // Group orphan tasks by owner
    const orphanTasksByOwner = orphanTasks.reduce((acc, share) => {
        const owner = share.task?.todoList?.owner;
        const ownerId = owner?.id || 'unknown';
        if (!acc[ownerId]) {
            acc[ownerId] = {
                owner,
                tasks: []
            };
        }
        acc[ownerId].tasks.push(share);
        return acc;
    }, {} as Record<string, { owner?: any; tasks: TaskShare[] }>);

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

            {/* Shared Individual Tasks Section */}
            {Object.keys(orphanTasksByOwner).length > 0 && (
                <div className="mb-12">
                    <h2 className="text-sm font-bold text-tertiary uppercase tracking-wider mb-4 px-1">
                        Shared Individual Tasks
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(orphanTasksByOwner).map(([ownerId, group]) => {
                            const ownerName = group.owner?.name || group.owner?.email.split('@')[0] || 'Unknown User';
                            return (
                                <div key={ownerId} className="premium-card p-6">
                                    <Link
                                        to={`/lists/shared/tasks?ownerId=${ownerId}`}
                                        className="block group"
                                    >
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <h3 className="text-lg font-bold text-primary group-hover:text-accent transition-colors leading-tight">
                                                Tasks from {ownerName}
                                            </h3>
                                            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-1 rounded border border-accent/20 group-hover:bg-accent group-hover:text-white transition-all whitespace-nowrap">
                                                View Tasks
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-tertiary">
                                            <div className="w-1.5 h-1.5 rounded-full bg-accent/40"></div>
                                            <span>{group.tasks.length} tasks shared with you</span>
                                        </div>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
