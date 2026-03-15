/**
 * Unit tests for AnalysisScreen error/retry UI.
 * Validates: Requirements 5.8
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// ── Mock heavy native/navigation dependencies ──────────────────────────────

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: jest.fn() }),
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

jest.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      surface: '#fff',
      card: '#fff',
      primary: '#6366f1',
      text: '#000',
      textSecondary: '#666',
      border: '#e5e7eb',
      shadow: '#000',
      success: '#22c55e',
      error: '#ef4444',
      warning: '#f59e0b',
    },
  }),
}));

jest.mock('../../utils/useThemedStyles', () => ({
  useThemedStyles: (fn: (colors: Record<string, string>) => Record<string, unknown>) => {
    const colors = {
      surface: '#fff',
      card: '#fff',
      primary: '#6366f1',
      text: '#000',
      textSecondary: '#666',
      border: '#e5e7eb',
      shadow: '#000',
      success: '#22c55e',
      error: '#ef4444',
      warning: '#f59e0b',
    };
    return fn(colors);
  },
}));

// ── Mock useAnalysisData ───────────────────────────────────────────────────

const mockRetry = jest.fn();

jest.mock('../../hooks/useAnalysisData', () => ({
  useAnalysisData: jest.fn(),
}));

import { useAnalysisData } from '../../hooks/useAnalysisData';
import AnalysisScreen from '../AnalysisScreen';

const mockUseAnalysisData = useAnalysisData as jest.MockedFunction<typeof useAnalysisData>;

// ── Helpers ────────────────────────────────────────────────────────────────

const emptyData = {
  heatmapData: {},
  streak: 0,
  trendData: [],
  tasksByList: [],
  dueDateOverview: { overdue: 0, dueToday: 0, dueThisWeek: 0, withDueDate: 0 },
  stepsProgress: { tasksWithSteps: 0, completedSteps: 0, totalSteps: 0 },
  loading: false,
  error: null,
  retry: mockRetry,
};

// ── Tests ──────────────────────────────────────────────────────────────────

describe('AnalysisScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('error state', () => {
    it('renders error message when useAnalysisData returns an error', () => {
      mockUseAnalysisData.mockReturnValue({
        ...emptyData,
        error: new Error('Network request failed'),
      });

      const { getByText } = render(<AnalysisScreen />);

      expect(getByText('Network request failed')).toBeTruthy();
    });

    it('renders retry button when useAnalysisData returns an error', () => {
      mockUseAnalysisData.mockReturnValue({
        ...emptyData,
        error: new Error('Something went wrong'),
      });

      const { getByTestId } = render(<AnalysisScreen />);

      expect(getByTestId('retry-button')).toBeTruthy();
    });

    it('calls retry() when the retry button is pressed', () => {
      mockUseAnalysisData.mockReturnValue({
        ...emptyData,
        error: new Error('Something went wrong'),
      });

      const { getByTestId } = render(<AnalysisScreen />);

      fireEvent.press(getByTestId('retry-button'));

      expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it('does not render data sections when error is set', () => {
      mockUseAnalysisData.mockReturnValue({
        ...emptyData,
        error: new Error('Fetch failed'),
      });

      const { queryByText } = render(<AnalysisScreen />);

      expect(queryByText('Tasks by List')).toBeNull();
      expect(queryByText('Completion Streak')).toBeNull();
    });
  });

  describe('loading state', () => {
    it('renders ActivityIndicator while loading', () => {
      mockUseAnalysisData.mockReturnValue({
        ...emptyData,
        loading: true,
      });

      const { UNSAFE_getByType } = render(<AnalysisScreen />);
      const { ActivityIndicator } = require('react-native');

      expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    });

    it('does not render data sections while loading', () => {
      mockUseAnalysisData.mockReturnValue({
        ...emptyData,
        loading: true,
      });

      const { queryByText } = render(<AnalysisScreen />);

      expect(queryByText('Tasks by List')).toBeNull();
    });
  });

  describe('data state', () => {
    it('renders Tasks by List section when data is available', () => {
      mockUseAnalysisData.mockReturnValue({
        ...emptyData,
        tasksByList: [{ listName: 'Work', completed: 3, pending: 2 }],
      });

      const { getByText } = render(<AnalysisScreen />);

      expect(getByText('Tasks by List')).toBeTruthy();
      expect(getByText('Work')).toBeTruthy();
    });

    it('renders streak counter card', () => {
      mockUseAnalysisData.mockReturnValue({
        ...emptyData,
        streak: 5,
      });

      const { getByText } = render(<AnalysisScreen />);

      expect(getByText('Completion Streak')).toBeTruthy();
      expect(getByText('5')).toBeTruthy();
    });

    it('renders steps progress card when tasks have steps', () => {
      mockUseAnalysisData.mockReturnValue({
        ...emptyData,
        stepsProgress: { tasksWithSteps: 2, completedSteps: 4, totalSteps: 6 },
      });

      const { getByText } = render(<AnalysisScreen />);

      expect(getByText('Steps Progress')).toBeTruthy();
    });
  });
});
