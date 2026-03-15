import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, PanResponder, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../../types';
import { formatDate } from '../../utils/helpers';
import { isOverdue, isRepeatingTask as checkIsRepeatingTask } from '../../utils/taskHelpers';
import { createTasksStyles } from '../../screens/styles/TasksScreen.styles';
import { useThemedStyles } from '../../utils/useThemedStyles';
import { useTheme } from '../../context/ThemeContext';

// Each ~60px of drag distance corresponds to 1 position change
const DRAG_POSITION_THRESHOLD = 60;
const LONG_PRESS_DURATION = 500;

export interface SortableTaskItemProps {
  task: Task;
  onPress: () => void;
  onToggle: () => void;
  onDragEnd: (newOrder: number) => void;
}

export function SortableTaskItem({ task, onPress, onToggle, onDragEnd }: SortableTaskItemProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createTasksStyles);
  const isCompleted = Boolean(task.completed);
  const isOverdueTask = isOverdue(task);
  const isRepeating = checkIsRepeatingTask(task);
  const completionCount = task.completionCount || 0;

  const [isDragging, setIsDragging] = useState(false);
  const translateY = useRef(new Animated.Value(0)).current;
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragActivated = useRef(false);
  const startY = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: () => dragActivated.current,

      onPanResponderGrant: (evt) => {
        startY.current = evt.nativeEvent.pageY;
        translateY.setValue(0);
      },

      onPanResponderMove: (_, gestureState) => {
        if (dragActivated.current) {
          translateY.setValue(gestureState.dy);
        }
      },

      onPanResponderRelease: (_, gestureState) => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }

        if (dragActivated.current) {
          const positionDelta = Math.round(gestureState.dy / DRAG_POSITION_THRESHOLD);
          const newOrder = Math.max(0, task.order + positionDelta);

          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();

          dragActivated.current = false;
          setIsDragging(false);
          onDragEnd(newOrder);
        }
      },

      onPanResponderTerminate: () => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        if (dragActivated.current) {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          dragActivated.current = false;
          setIsDragging(false);
        }
      },
    })
  ).current;

  const handleLongPressIn = () => {
    longPressTimer.current = setTimeout(() => {
      dragActivated.current = true;
      setIsDragging(true);
    }, LONG_PRESS_DURATION);
  };

  const handlePressOut = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <Animated.View
      style={[
        styles.taskItem,
        isCompleted && styles.taskItemCompleted,
        isOverdueTask && styles.taskItemOverdue,
        isDragging && localStyles.dragging,
        localStyles.row,
        { transform: [{ translateY }] },
      ]}
      {...panResponder.panHandlers}
    >
      {/* Drag handle — long-press activates drag mode */}
      <TouchableOpacity
        style={localStyles.dragHandle}
        onPressIn={handleLongPressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.6}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityLabel="Drag to reorder"
        accessibilityRole="button"
      >
        <Text style={[localStyles.dragHandleIcon, { color: colors.textSecondary }]}>≡</Text>
      </TouchableOpacity>

      {/* Task row content */}
      <TouchableOpacity
        style={[styles.taskContent, localStyles.taskContentFlex]}
        onPress={onPress}
        activeOpacity={0.7}
        disabled={isDragging}
      >
        <TouchableOpacity
          style={[styles.taskCheckbox, isCompleted && styles.taskCheckboxCompleted]}
          onPress={onToggle}
          activeOpacity={0.6}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          disabled={isDragging}
        >
          {isCompleted && <Ionicons name="checkmark" size={18} color="#fff" />}
        </TouchableOpacity>

        <View style={styles.taskTextContainer}>
          <Text style={[styles.taskText, isCompleted && styles.taskTextCompleted]}>
            {task.description}
          </Text>

          {(task.dueDate || (isRepeating && completionCount > 0)) && (
            <View style={styles.taskMetaRow}>
              {task.dueDate && (
                <View style={styles.metaItem}>
                  <Ionicons
                    name="calendar-outline"
                    size={12}
                    color={isOverdueTask ? colors.error : colors.textSecondary}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.dueDate, isOverdueTask && styles.dueDateOverdue]}>
                    {formatDate(task.dueDate)}
                  </Text>
                </View>
              )}

              {isRepeating && completionCount > 0 && (
                <View style={[styles.metaItem, { backgroundColor: colors.success + '15' }]}>
                  <Ionicons
                    name="repeat-outline"
                    size={12}
                    color={colors.success}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.completionCount}>{completionCount}x</Text>
                </View>
              )}
            </View>
          )}
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.border}
          style={{ alignSelf: 'center' }}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

const localStyles = StyleSheet.create({
  dragHandle: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 12,
    paddingVertical: 4,
  },
  dragHandleIcon: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
  },
  taskContentFlex: {
    flex: 1,
  },
  dragging: {
    opacity: 0.85,
    shadowOpacity: 0.3,
    elevation: 12,
    zIndex: 999,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
