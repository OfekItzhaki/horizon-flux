import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  PieChart,
  BarChart,
  LineChart,
  ContributionGraph,
} from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';
import { useAnalysisData } from '../hooks/useAnalysisData';
import { useThemedStyles } from '../utils/useThemedStyles';
import { useTheme } from '../context/ThemeContext';
import { handleApiError } from '../utils/errorHandler';

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
    typeCard: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    typeTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
      textTransform: 'capitalize',
    },
    typeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    typeLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    typeValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surface,
    },
    streakContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary + '10',
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.primary + '20',
    },
    streakValue: {
      fontSize: 24,
      fontWeight: '900',
      color: '#f97316',
    },
    streakLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
  }));

  const {
    lists,
    allTasks,
    isLoading,
    hasError,
    refetchLists,
    refetchTasks,
    stats,
    dailyCompletions,
    dailyTrends,
    currentStreak,
  } = useAnalysisData();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchLists(), refetchTasks()]);
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width - 64;

  const chartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: (opacity = 1) => colors.textSecondary,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.primary,
    },
  };

  const pieData = [
    {
      name: 'Completed',
      population: stats.completedTasks.length,
      color: colors.success,
      legendFontColor: colors.textSecondary,
      legendFontSize: 12,
    },
    {
      name: 'Pending',
      population: stats.pendingTasks.length,
      color: colors.primary + '40',
      legendFontColor: colors.textSecondary,
      legendFontSize: 12,
    },
  ];

  const barData = {
    labels: stats.tasksByList.slice(0, 5).map((l: any) => l.listName.substring(0, 6)),
    datasets: [
      {
        data: stats.tasksByList.slice(0, 5).map((l: any) => l.total),
      },
    ],
  };

  const lineData = {
    labels: dailyTrends.slice(-7).map((t: any) => t.label.split(' ')[1]), // Just the day
    datasets: [
      {
        data: dailyTrends.slice(-7).map((t: any) => t.completions),
        color: (opacity = 1) => colors.primary,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
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

        {/* Overview Stats */}
        <View style={styles.card}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{lists.length}</Text>
              <Text style={styles.statLabel}>Lists</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{allTasks.length}</Text>
              <Text style={styles.statLabel}>Total Tasks</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValueGreen}>{stats.completedTasks.length}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValueBlue}>{stats.completionRate.toFixed(0)}%</Text>
              <Text style={styles.statLabel}>Complete</Text>
            </View>
          </View>
        </View>

        {/* Daily Streak & Contribution Graph */}
        <View style={styles.card}>
          <View style={styles.streakContainer}>
            <Ionicons name="flame" size={32} color="#f97316" />
            <View style={{ marginLeft: 16 }}>
              <Text style={styles.streakValue}>{currentStreak} Days</Text>
              <Text style={styles.streakLabel}>Current Daily Streak</Text>
            </View>
          </View>
          <Text style={[styles.cardTitle, { marginTop: 24, fontSize: 16 }]}>
            Activity Heatmap
          </Text>
          <View style={{ alignItems: 'center', marginLeft: -16 }}>
            <ContributionGraph
              values={dailyCompletions}
              endDate={new Date()}
              numDays={90}
              width={screenWidth + 32}
              height={220}
              chartConfig={chartConfig}
              tooltipDataAttrs={(v: any) => ({})}
            />
          </View>
        </View>

        {/* Visual Charts */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Completion Status</Text>
          <PieChart
            data={pieData}
            width={screenWidth}
            height={200}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tasks by List</Text>
          <BarChart
            data={barData}
            width={screenWidth}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={chartConfig}
            verticalLabelRotation={30}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>7-Day Trend</Text>
          <LineChart
            data={lineData}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>

        {/* Due Date Statistics */}
        {stats.tasksWithDueDates.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Due Date Overview</Text>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: colors.error }]}>
                  {stats.overdueTasks.length}
                </Text>
                <Text style={styles.statLabel}>Overdue</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: colors.warning }]}>
                  {stats.dueTodayTasks.length}
                </Text>
                <Text style={styles.statLabel}>Due Today</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: colors.warning }]}>
                  {stats.dueThisWeekTasks.length}
                </Text>
                <Text style={styles.statLabel}>Due This Week</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.tasksWithDueDates.length}</Text>
                <Text style={styles.statLabel}>With Dates</Text>
              </View>
            </View>
          </View>
        )}

        {/* Step Progress */}
        {stats.totalSteps > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Steps Progress</Text>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.totalSteps}</Text>
                <Text style={styles.statLabel}>Total Steps</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValueGreen}>{stats.completedSteps}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValueBlue}>
                  {stats.stepsCompletionRate.toFixed(0)}%
                </Text>
                <Text style={styles.statLabel}>Progress</Text>
              </View>
            </View>
            <View style={[styles.progressBar, { marginTop: 16 }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${stats.stepsCompletionRate}%` },
                ]}
              />
            </View>
          </View>
        )}

        {/* Tasks by List */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tasks by List (Detailed)</Text>
          {stats.tasksByList.map((item: any, index: number) => {
            const progress = item.total > 0 ? (item.completed / item.total) * 100 : 0;
            return (
              <View key={index}>
                <View style={styles.listRow}>
                  <Text style={styles.listName}>{item.listName}</Text>
                  <View style={styles.listStats}>
                    <Text style={styles.listStat}>{item.total} total</Text>
                    <Text style={styles.listStatGreen}>{item.completed} ✓</Text>
                    <Text style={styles.listStatRed}>{item.pending} ⏳</Text>
                  </View>
                </View>
                {item.total > 0 && (
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
