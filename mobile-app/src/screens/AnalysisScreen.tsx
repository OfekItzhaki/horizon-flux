import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAnalysisData } from '../hooks/useAnalysisData';
import { useThemedStyles } from '../utils/useThemedStyles';
import { useTheme } from '../context/ThemeContext';

export default function AnalysisScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = useThemedStyles((colors) => ({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    scrollView: {
      flex: 1,
    },
    headerContainer: {
      backgroundColor: colors.card,
      padding: 24,
      paddingTop: Platform.OS === 'ios' ? 60 : 45,
      paddingBottom: 24,
      borderBottomWidth: 0,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
      position: 'relative',
      overflow: 'hidden',
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    backButton: {
      padding: 10,
      borderRadius: 12,
      backgroundColor: colors.primary + '15',
    },
    headerGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '50%',
      opacity: 0.08,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 0,
      paddingBottom: 24,
    },
    title: {
      fontSize: 40,
      fontWeight: '900',
      color: colors.primary,
      marginBottom: 0,
      letterSpacing: -1,
      textShadowColor: 'rgba(99, 102, 241, 0.2)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
      textAlign: 'center',
      flex: 1,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 20,
    },
    statCard: {
      alignItems: 'center',
      flex: 1,
    },
    statValue: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    statValueGreen: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.success,
      marginBottom: 4,
    },
    statValueBlue: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 4,
    },
    listRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    listName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    listStats: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    listStat: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    listStatGreen: {
      fontSize: 14,
      color: colors.success,
      fontWeight: '600',
    },
    listStatRed: {
      fontSize: 14,
      color: colors.error,
      fontWeight: '600',
    },
    progressBar: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      marginTop: 8,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 4,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surface,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: 24,
    },
    errorText: {
      fontSize: 16,
      color: colors.error,
      textAlign: 'center',
      marginBottom: 16,
    },
    retryButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      backgroundColor: colors.primary,
      borderRadius: 8,
    },
    retryButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 16,
    },
    skeletonBlock: {
      backgroundColor: colors.border,
      borderRadius: 8,
      marginBottom: 12,
    },
    trendRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      height: 60,
      gap: 2,
      marginTop: 8,
    },
    trendBar: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: 2,
      minHeight: 2,
    },
  }));

  const {
    heatmapData,
    streak,
    trendData,
    tasksByList,
    dueDateOverview,
    stepsProgress,
    loading,
    error,
    retry,
  } = useAnalysisData();

  // ── Header (always rendered) ───────────────────────────────────────────────
  const header = (
    <View style={styles.headerContainer}>
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
        <Text style={styles.title}>Task Analysis</Text>
        <View style={{ width: 40 }} />
      </View>
    </View>
  );

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.container}>
        {header}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          {/* Skeleton placeholders */}
          <View style={{ width: '90%', marginTop: 24 }}>
            <View style={[styles.skeletonBlock, { height: 100 }]} />
            <View style={[styles.skeletonBlock, { height: 80 }]} />
            <View style={[styles.skeletonBlock, { height: 120 }]} />
            <View style={[styles.skeletonBlock, { height: 80 }]} />
          </View>
        </View>
      </View>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <View style={styles.container}>
        {header}
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error.message || 'Unable to load analysis data.'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={retry} testID="retry-button">
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Derived display values ─────────────────────────────────────────────────
  const totalTasks = tasksByList.reduce((sum, l) => sum + l.completed + l.pending, 0);
  const totalCompleted = tasksByList.reduce((sum, l) => sum + l.completed, 0);
  const completionRate = totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;

  const maxTrend = Math.max(...trendData.map((d) => d.count), 1);

  // ── Heatmap: count active days in the 90-day window ───────────────────────
  const activeDays = Object.values(heatmapData).filter((v) => v > 0).length;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {header}

        {/* Overview Stats */}
        <View style={styles.card}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{tasksByList.length}</Text>
              <Text style={styles.statLabel}>Lists</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalTasks}</Text>
              <Text style={styles.statLabel}>Total Tasks</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValueGreen}>{totalCompleted}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValueBlue}>{completionRate.toFixed(0)}%</Text>
              <Text style={styles.statLabel}>Complete</Text>
            </View>
          </View>
        </View>

        {/* Streak Counter */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Completion Streak</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { fontSize: 48, color: colors.primary }]}>
                {streak}
              </Text>
              <Text style={styles.statLabel}>
                {streak === 1 ? 'day streak' : 'day streak'}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValueBlue}>{activeDays}</Text>
              <Text style={styles.statLabel}>Active Days (90d)</Text>
            </View>
          </View>
        </View>

        {/* Completion Trend (last 30 days) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Completion Trend (30 days)</Text>
          <View style={styles.trendRow}>
            {trendData.map((d) => (
              <View
                key={d.date}
                style={[
                  styles.trendBar,
                  { height: `${Math.max((d.count / maxTrend) * 100, 3)}%` },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Due Date Overview */}
        {dueDateOverview.withDueDate > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Due Date Overview</Text>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: colors.error }]}>
                  {dueDateOverview.overdue}
                </Text>
                <Text style={styles.statLabel}>Overdue</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: colors.warning }]}>
                  {dueDateOverview.dueToday}
                </Text>
                <Text style={styles.statLabel}>Due Today</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: colors.warning }]}>
                  {dueDateOverview.dueThisWeek}
                </Text>
                <Text style={styles.statLabel}>Due This Week</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{dueDateOverview.withDueDate}</Text>
                <Text style={styles.statLabel}>With Dates</Text>
              </View>
            </View>
          </View>
        )}

        {/* Tasks by List */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tasks by List</Text>
          {tasksByList.map((item, index) => {
            const total = item.completed + item.pending;
            const progress = total > 0 ? (item.completed / total) * 100 : 0;
            return (
              <View key={index}>
                <View style={styles.listRow}>
                  <Text style={styles.listName}>{item.listName}</Text>
                  <View style={styles.listStats}>
                    <Text style={styles.listStat}>{total} total</Text>
                    <Text style={styles.listStatGreen}>{item.completed} ✓</Text>
                    <Text style={styles.listStatRed}>{item.pending} ⏳</Text>
                  </View>
                </View>
                {total > 0 && (
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Steps Progress */}
        {stepsProgress.tasksWithSteps > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Steps Progress</Text>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stepsProgress.tasksWithSteps}</Text>
                <Text style={styles.statLabel}>Tasks with Steps</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValueGreen}>{stepsProgress.completedSteps}</Text>
                <Text style={styles.statLabel}>Completed Steps</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValueBlue}>{stepsProgress.totalSteps}</Text>
                <Text style={styles.statLabel}>Total Steps</Text>
              </View>
            </View>
            {stepsProgress.totalSteps > 0 && (
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(stepsProgress.completedSteps / stepsProgress.totalSteps) * 100}%`,
                    },
                  ]}
                />
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
