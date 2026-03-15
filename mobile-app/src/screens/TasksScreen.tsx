import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect, RouteProp, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RootStackParamList } from '../navigation/AppNavigator';
import { tasksService } from '../services/tasks.service';
import { getSocket } from '../utils/socket';
import { Task, CreateTaskDto, ListType } from '../types';
import type { ReminderConfig } from '@tasks-management/frontend-services';
import ReminderConfigComponent from '../components/ReminderConfig';
import DatePicker from '../components/DatePicker';
import {
  scheduleTaskReminders,
  cancelAllTaskNotifications,
  rescheduleAllReminders,
} from '../services/notifications.service';
import { ReminderTimesStorage, ReminderAlarmsStorage } from '../utils/storage';
import { convertRemindersToBackend } from '@tasks-management/frontend-services';
import { formatDate } from '../utils/helpers';
import { handleApiError, isAuthError, showErrorAlert } from '../utils/errorHandler';
import { useTheme } from '../context/ThemeContext';
import { useThemedStyles } from '../utils/useThemedStyles';
import { createTasksStyles } from './styles/TasksScreen.styles';
import { FloatingActionButton } from '../components/common/FloatingActionButton';
import { SortableTaskItem } from '../components/common/SortableTaskItem';
import { usePagination } from '../hooks/usePagination';
import { useQueuedMutation } from '../hooks/useQueuedMutation';

type TasksScreenRouteProp = RouteProp<RootStackParamList, 'Tasks'>;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function TasksScreen() {
  const route = useRoute<TasksScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { listId, listName, listType } = route.params;
  const { colors } = useTheme();
  const styles = useThemedStyles(createTasksStyles);

  // Check if this is the archived list
  const isArchivedList = listType === ListType.FINISHED;
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList<Task>>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [taskReminders, setTaskReminders] = useState<ReminderConfig[]>([]);
  const [sortBy, setSortBy] = useState<'default' | 'dueDate' | 'completed' | 'alphabetical'>(
    'default',
  );
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch tasks with TanStack Query
  const {
    data: allTasks = [],
    isLoading: loading,
    isRefetching: refreshing,
    refetch: loadTasks,
  } = useQuery({
    queryKey: ['tasks', listId],
    queryFn: () => tasksService.getAll(listId),
    select: (data: Task[]) =>
      data.map((task: Task) => ({ ...task, completed: Boolean(task.completed) })),
  });

  // useQueuedMutation for task completion toggle (Requirement 7.5)
  const toggleTaskMutation = useQueuedMutation<Task, any, Task, any>({
    mutationKey: ['toggleTask', listId],
    mutationFn: (task: Task) => tasksService.update(task.id, { completed: !task.completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', listId] });
      rescheduleAllReminders();
    },
    onError: (error: any) => handleApiError(error, 'Failed to update task'),
  });

  const addTaskMutation = useMutation({
    mutationFn: (data: CreateTaskDto) => tasksService.create(listId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', listId] });
      setNewTaskDescription('');
      setNewTaskDueDate('');
      setTaskReminders([]);
      setShowAddModal(false);
    },
    onError: (error: any) => handleApiError(error, 'Failed to add task'),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => tasksService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', listId] });
    },
    onError: (error: any) => handleApiError(error, 'Failed to delete task'),
  });

  // Real-time Presence: Join/Leave room
  useEffect(() => {
    let socketInstance: any;

    const setupSocket = async () => {
      socketInstance = await getSocket();
      socketInstance.emit('enter-list', { listId });

      socketInstance.on('presence-update', (data: any) => {
        if (__DEV__) console.log('Presence update:', data);
      });
    };

    setupSocket();

    return () => {
      if (socketInstance) {
        socketInstance.emit('leave-list', { listId });
        socketInstance.off('presence-update');
      }
    };
  }, [listId]);

  useFocusEffect(
    React.useCallback(() => {
      loadTasks();
      rescheduleAllReminders().catch(() => {});
    }, [loadTasks]),
  );

  const applyFilter = (tasksToFilter: Task[]): Task[] => {
    if (!searchQuery.trim()) {
      return tasksToFilter;
    }
    const query = searchQuery.toLowerCase().trim();
    return tasksToFilter.filter((task) => task.description.toLowerCase().includes(query));
  };

  const filteredAndSortedTasks = React.useMemo(() => {
    let result = applyFilter(allTasks);

    switch (sortBy) {
      case 'dueDate':
        result.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
        break;
      case 'completed':
        result.sort((a, b) => {
          if (a.completed === b.completed) return 0;
          return a.completed ? 1 : -1;
        });
        break;
      case 'alphabetical':
        result.sort((a, b) => a.description.localeCompare(b.description));
        break;
      default:
        result.sort((a, b) => a.order - b.order);
    }
    return result;
  }, [allTasks, searchQuery, sortBy]);

  // Pagination — default page size 25 (Requirement 8.3)
  // usePagination resets to page 1 whenever filteredAndSortedTasks reference changes,
  // which happens on search query or sort option change (Requirements 8.6, 8.7)
  const { page: pagedTasks, currentPage, totalPages, nextPage, prevPage, hasNext, hasPrev } =
    usePagination(filteredAndSortedTasks, 25);

  // Scroll to top when page changes (Requirement 8.4)
  useEffect(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [currentPage]);

  const onRefresh = () => {
    loadTasks();
  };

  const toggleTask = (task: Task) => {
    toggleTaskMutation.mutate(task);
  };

  // Drag-to-reorder handler (Requirements 10.3, 10.4)
  const handleDragEnd = async (task: Task, newOrder: number) => {
    const previousTasks = allTasks;
    try {
      await tasksService.update(task.id, { order: newOrder });
      queryClient.invalidateQueries({ queryKey: ['tasks', listId] });
    } catch (error: any) {
      // Revert to pre-drag order by re-fetching (Requirement 10.4)
      queryClient.setQueryData(['tasks', listId], previousTasks);
      Alert.alert('Reorder Failed', 'Could not save the new task order. Please try again.');
    }
  };

  const handleAddTask = async () => {
    if (!newTaskDescription.trim()) {
      showErrorAlert('Validation Error', null, 'Please enter a task description before adding.');
      return;
    }

    const taskData: CreateTaskDto = {
      description: newTaskDescription.trim(),
    };

    let dueDateStr: string | undefined;
    if (newTaskDueDate.trim()) {
      const date = new Date(newTaskDueDate);
      if (!isNaN(date.getTime())) {
        dueDateStr = date.toISOString();
        taskData.dueDate = dueDateStr;
      }
    }

    if (taskReminders.length > 0) {
      const reminderData = convertRemindersToBackend(taskReminders, dueDateStr);
      taskData.reminderDaysBefore = reminderData.reminderDaysBefore || [];
      taskData.specificDayOfWeek = reminderData.specificDayOfWeek ?? undefined;
    } else {
      taskData.reminderDaysBefore = [];
      taskData.specificDayOfWeek = undefined;
    }

    addTaskMutation.mutate(taskData);
  };

  const handleDeleteTask = (task: Task) => {
    Alert.alert('Delete Task', `Are you sure you want to delete "${task.description}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          cancelAllTaskNotifications(task.id);
          ReminderTimesStorage.removeTimesForTask(task.id);
          ReminderAlarmsStorage.removeAlarmsForTask(task.id);
          deleteTaskMutation.mutate(task.id);
        },
      },
    ]);
  };

  const handleArchivedTaskOptions = (task: Task) => {
    Alert.alert('Archived Task', `What would you like to do with "${task.description}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Restore',
        onPress: async () => {
          try {
            await tasksService.restore(task.id);
            showErrorAlert('Success', null, 'Task restored to original list');
            loadTasks();
          } catch (error: unknown) {
            handleApiError(error, 'Unable to restore task. Please try again.');
          }
        },
      },
      {
        text: 'Delete Forever',
        style: 'destructive',
        onPress: async () => {
          Alert.alert(
            'Permanently Delete?',
            'This action cannot be undone. The task will be deleted forever.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete Forever',
                style: 'destructive',
                onPress: async () => {
                  try {
                    await cancelAllTaskNotifications(task.id);
                    await ReminderTimesStorage.removeTimesForTask(task.id);
                    await ReminderAlarmsStorage.removeAlarmsForTask(task.id);
                    await tasksService.permanentDelete(task.id);
                    loadTasks();
                  } catch (error: unknown) {
                    handleApiError(error, 'Unable to delete task. Please try again.');
                  }
                },
              },
            ],
          );
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <LinearGradient
          colors={[colors.primary, '#a855f7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        />
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.title}>{listName}</Text>
            <Text style={styles.taskCount}>
              {filteredAndSortedTasks.length} task{filteredAndSortedTasks.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.searchSortRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.sortButton} onPress={() => setShowSortMenu(true)}>
            <Text style={styles.sortButtonText}>
              Sort:{' '}
              {sortBy === 'default'
                ? 'Default'
                : sortBy === 'dueDate'
                  ? 'Due Date'
                  : sortBy === 'completed'
                    ? 'Status'
                    : 'A-Z'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Task list — shows current page of tasks */}
      <FlatList
        ref={flatListRef}
        data={pagedTasks}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={true}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <SortableTaskItem
            task={item}
            onPress={() => navigation.navigate('TaskDetails', { taskId: item.id })}
            onToggle={() => toggleTask(item)}
            onDragEnd={(newOrder) => handleDragEnd(item, newOrder)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyText}>No tasks yet</Text>
            <Text style={styles.emptySubtext}>Tap the + button below to add your first task</Text>
          </View>
        }
        ListFooterComponent={
          totalPages > 1 ? (
            <View style={localStyles.paginationContainer}>
              <TouchableOpacity
                style={[localStyles.pageButton, !hasPrev && localStyles.pageButtonDisabled]}
                onPress={prevPage}
                disabled={!hasPrev}
                accessibilityLabel="Previous page"
              >
                <Text style={[localStyles.pageButtonText, !hasPrev && localStyles.pageButtonTextDisabled]}>
                  Previous
                </Text>
              </TouchableOpacity>

              <Text style={[localStyles.pageInfo, { color: colors.text }]}>
                Page {currentPage} of {totalPages}
              </Text>

              <TouchableOpacity
                style={[localStyles.pageButton, !hasNext && localStyles.pageButtonDisabled]}
                onPress={nextPage}
                disabled={!hasNext}
                accessibilityLabel="Next page"
              >
                <Text style={[localStyles.pageButtonText, !hasNext && localStyles.pageButtonTextDisabled]}>
                  Next
                </Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        contentContainerStyle={
          pagedTasks.length === 0 ? styles.emptyContainer : styles.listContentContainer
        }
      />

      {/* FloatingActionButton replaces the inline add-task trigger (Requirement 9.4) */}
      <FloatingActionButton
        onPress={() => setShowAddModal(true)}
        ariaLabel="Add new task"
      />

      {/* Add Task Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Task</Text>

            <ScrollView
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
            >
              <TextInput
                style={styles.input}
                placeholder="Task description"
                value={newTaskDescription}
                onChangeText={setNewTaskDescription}
                multiline
                autoFocus
                placeholderTextColor="#999"
              />

              <DatePicker
                value={newTaskDueDate}
                onChange={setNewTaskDueDate}
                placeholder="Due date (Optional)"
              />

              <ReminderConfigComponent
                reminders={taskReminders}
                onRemindersChange={setTaskReminders}
              />
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddModal(false);
                  setNewTaskDescription('');
                  setNewTaskDueDate('');
                  setTaskReminders([]);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleAddTask}
                disabled={addTaskMutation.isPending}
              >
                {addTaskMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Add Task</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Sort Menu Modal */}
      <Modal
        visible={showSortMenu}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowSortMenu(false)}
      >
        <TouchableOpacity
          style={styles.sortMenuOverlay}
          activeOpacity={1}
          onPress={() => setShowSortMenu(false)}
        >
          <View style={styles.sortMenuContent}>
            <Text style={styles.sortMenuTitle}>Sort Tasks</Text>
            {[
              { value: 'default', label: 'Default (Order)' },
              { value: 'dueDate', label: 'Due Date' },
              { value: 'completed', label: 'Completion Status' },
              { value: 'alphabetical', label: 'Alphabetical' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.sortOption, sortBy === option.value && styles.sortOptionSelected]}
                onPress={() => {
                  setSortBy(option.value as any);
                  setShowSortMenu(false);
                }}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    sortBy === option.value && styles.sortOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {sortBy === option.value && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const localStyles = StyleSheet.create({
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 80, // space for FAB
  },
  pageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#6366f1',
  },
  pageButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  pageButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  pageButtonTextDisabled: {
    color: '#9ca3af',
  },
  pageInfo: {
    fontSize: 14,
    fontWeight: '500',
  },
});
