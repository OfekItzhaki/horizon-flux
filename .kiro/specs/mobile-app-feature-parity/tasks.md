# Implementation Plan: Mobile App Feature Parity

## Overview

Incremental implementation across four layers — services, hooks, components, screens — wiring each piece together before moving to the next. Each task builds on the previous so there is no orphaned code.

## Tasks

- [x] 1. Extend services layer
  - [x] 1.1 Extend `notifications.service.ts` with push token registration, Android channel setup, and reminder rescheduling
    - Add `requestNotificationPermissions(): Promise<boolean>`
    - Add `registerPushToken(token: string): Promise<void>` (calls `POST /me/push-token`)
    - Add `setupAndroidChannels()` — "Task Reminders" (HIGH) and "Daily Tasks" (LOW)
    - Add `rescheduleAllReminders(userId: string): Promise<void>` (calls `GET /reminders/range`, cancels stale, schedules active)
    - Add Expo Go guard: skip all paths and log dev warning when running in Expo Go
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.4, 2.5, 2.6, 2.7_

  - [ ]* 1.2 Write unit tests for Android notification channel configuration
    - Verify "Task Reminders" channel is created with HIGH importance
    - Verify "Daily Tasks" channel is created with LOW importance
    - _Requirements: 2.6, 2.7_

  - [x] 1.3 Extend `users.service.ts` with `registerPushToken(token: string): Promise<void>`
    - Calls `POST /me/push-token` with `{ token, platform }`
    - _Requirements: 1.3_

- [x] 2. Implement `useNotifications` hook
  - [x] 2.1 Create `mobile-app/src/hooks/useNotifications.ts`
    - On mount (authenticated): call `requestNotificationPermissions`, obtain push token, call `users.service.registerPushToken`
    - Retry push token registration once after 5 s on failure, then silently fail
    - On mount (authenticated + tasks loaded): call `rescheduleAllReminders`
    - On logout: call `Notifications.cancelAllScheduledNotificationsAsync`
    - Expo Go guard: skip all paths and log dev warning
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.4, 11.1, 11.2, 11.3, 11.4, 11.5_

  - [ ]* 2.2 Write property test for push notification registration round-trip (Property 1)
    - **Property 1: Push notification registration round-trip**
    - **Validates: Requirements 1.1, 1.2, 1.3**

  - [ ]* 2.3 Write property test for push token retry on failure (Property 2)
    - **Property 2: Push token registration retry on failure**
    - **Validates: Requirements 1.5**

  - [ ]* 2.4 Write property test for registration triggered when authenticated (Property 22)
    - **Property 22: useNotifications triggers registration when authenticated**
    - **Validates: Requirements 11.2**

  - [ ]* 2.5 Write property test for reschedule on startup (Property 23)
    - **Property 23: useNotifications reschedules reminders on startup**
    - **Validates: Requirements 11.3**

  - [ ]* 2.6 Write property test for cancel on logout (Property 24)
    - **Property 24: useNotifications cancels notifications on logout**
    - **Validates: Requirements 11.5**

- [x] 3. Implement `useAnalysisData` hook
  - [x] 3.1 Create `mobile-app/src/hooks/useAnalysisData.ts`
    - Fetch lists and tasks (with steps) via React Query
    - Derive `heatmapData` (trailing 90 days, ISO date → count)
    - Derive `streak` (consecutive-day suffix ending today or yesterday)
    - Derive `trendData` (last 30 days, ascending)
    - Derive `tasksByList`, `dueDateOverview`, `stepsProgress`
    - Expose `loading`, `error`, `retry`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_

  - [ ]* 3.2 Write property test for heatmap 90-day window (Property 8)
    - **Property 8: Heatmap covers exactly 90 days**
    - **Validates: Requirements 5.1**

  - [ ]* 3.3 Write property test for streak computation correctness (Property 9)
    - **Property 9: Streak computation correctness**
    - **Validates: Requirements 5.2**

  - [ ]* 3.4 Write property test for trend data has exactly 30 entries (Property 10)
    - **Property 10: Trend data has exactly 30 entries**
    - **Validates: Requirements 5.3**

  - [ ]* 3.5 Write property test for tasks-by-list grouping exhaustiveness (Property 11)
    - **Property 11: Tasks-by-list grouping is exhaustive and correct**
    - **Validates: Requirements 5.4**

  - [ ]* 3.6 Write property test for due-date overview counts (Property 12)
    - **Property 12: Due-date overview counts are correct**
    - **Validates: Requirements 5.5**

  - [ ]* 3.7 Write property test for steps progress counts (Property 13)
    - **Property 13: Steps progress counts are correct**
    - **Validates: Requirements 5.6**

- [x] 4. Implement `useQueuedMutation` hook
  - [x] 4.1 Create `mobile-app/src/hooks/useQueuedMutation.ts`
    - Wrap React Query `useMutation`
    - Call `onMutate` synchronously before dispatching the API call
    - Maintain an in-flight set keyed by `JSON.stringify(variables)` to deduplicate concurrent identical calls
    - On failure, invoke `onError` with original context for rollback
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 4.2 Write property test for optimistic update precedes API call (Property 16)
    - **Property 16: Optimistic update precedes API call**
    - **Validates: Requirements 7.1, 7.2**

  - [ ]* 4.3 Write property test for deduplication of identical concurrent mutations (Property 17)
    - **Property 17: Deduplication of identical concurrent mutations**
    - **Validates: Requirements 7.3**

- [x] 5. Implement `usePagination` hook
  - [x] 5.1 Create `mobile-app/src/hooks/usePagination.ts`
    - Accept `items: T[]`, optional `pageSize` (default 25)
    - Return `{ page, currentPage, totalPages, goToPage, nextPage, prevPage, hasNext, hasPrev }`
    - Reset to page 1 whenever `items` reference changes
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

  - [ ]* 5.2 Write property test for pagination slice correctness (Property 18)
    - **Property 18: Pagination slice correctness**
    - **Validates: Requirements 8.1**

  - [ ]* 5.3 Write property test for page reset on filter or sort change (Property 19)
    - **Property 19: Page resets to 1 on filter or sort change**
    - **Validates: Requirements 8.6, 8.7**

  - [ ]* 5.4 Write unit tests for pagination controls rendering
    - Verify controls render when task count > 25
    - Verify default page size is 25
    - _Requirements: 8.2, 8.3_

- [x] 6. Checkpoint — Ensure all hook tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement `FloatingActionButton` component
  - [x] 7.1 Create `mobile-app/src/components/common/FloatingActionButton.tsx`
    - Render circular button with `position: 'absolute'`, bottom-right, above tab bar via `useSafeAreaInsets`
    - Accept `onPress`, `ariaLabel`, `disabled`, `icon` props
    - When `disabled`, render with `opacity: 0.4` and `pointerEvents: 'none'`
    - _Requirements: 9.1, 9.2, 9.3, 9.5_

  - [ ]* 7.2 Write property test for FloatingActionButton disabled state (Property 20)
    - **Property 20: FloatingActionButton disabled state**
    - **Validates: Requirements 9.2, 9.3**

- [x] 8. Implement `SortableTaskItem` component
  - [x] 8.1 Create `mobile-app/src/components/common/SortableTaskItem.tsx`
    - Wrap task row with `PanResponder` long-press drag gesture
    - Display `≡` drag handle icon on leading edge
    - On drag release, call `onDragEnd(newOrder)` with computed position index
    - Accept `task`, `onPress`, `onToggle`, `onDragEnd` props
    - _Requirements: 10.1, 10.2, 10.5_

  - [ ]* 8.2 Write unit test for drag handle presence
    - Verify `≡` icon is rendered on each task row
    - _Requirements: 10.5_

  - [ ]* 8.3 Write property test for drag-to-reorder persists new order (Property 21)
    - **Property 21: Drag-to-reorder persists new order**
    - **Validates: Requirements 10.3**

- [x] 9. Implement `ShareListModal` component
  - [x] 9.1 Create `mobile-app/src/components/ShareListModal.tsx`
    - Accept `listId`, `visible`, `onClose` props
    - Fetch existing shares from `GET /list-shares/todo-list/:id` on open
    - Render email input, role picker (EDITOR | VIEWER), submit button
    - Submit calls `sharingService.shareList`; display success confirmation
    - Remove button triggers `Alert.alert` confirmation then calls `sharingService.unshareList`
    - Display inline errors without closing the modal
    - Use `Modal` with backdrop to prevent interaction with content behind
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.7_

  - [ ]* 9.2 Write property test for share submission calls correct API (Property 14)
    - **Property 14: Share submission calls correct API**
    - **Validates: Requirements 6.2**

  - [ ]* 9.3 Write property test for existing shares are displayed (Property 15)
    - **Property 15: Existing shares are displayed**
    - **Validates: Requirements 6.3**

  - [ ]* 9.4 Write unit test for remove confirmation flow
    - Verify `Alert.alert` is shown before calling unshare API
    - _Requirements: 6.4_

- [x] 10. Implement `VerifyEmailScreen`
  - [x] 10.1 Create `mobile-app/src/screens/VerifyEmailScreen.tsx`
    - Read `token` from route params (populated by deep link)
    - On mount, call `authService.verifyEmail(token)` exactly once
    - Success state: display confirmation, navigate to `Auth` after 3-second delay
    - Error state: display error message with "Back to Login" button
    - Missing token: immediately show error state
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 10.2 Write property test for verify email API call on valid token (Property 7)
    - **Property 7: Email verification API call on valid token**
    - **Validates: Requirements 4.2**

  - [ ]* 10.3 Write unit test for VerifyEmailScreen error state
    - Verify error state renders with "Back to Login" button when API returns error
    - _Requirements: 4.4_

- [x] 11. Update `AppNavigator` with VerifyEmailScreen and deep-link route
  - Add `VerifyEmailScreen` to the unauthenticated stack in `AppNavigator.tsx`
  - Extend linking config with `verify-email/:token` → `VerifyEmailScreen`
  - _Requirements: 4.1, 4.5_

  - [ ]* 11.1 Write unit test for deep-link routing to VerifyEmailScreen
    - Verify linking config maps `tasks-management://verify-email/:token` to `VerifyEmailScreen`
    - _Requirements: 4.1, 4.5_

- [x] 12. Update `AnalysisScreen` to use `useAnalysisData`
  - Refactor `mobile-app/src/screens/AnalysisScreen.tsx` to consume `useAnalysisData`
  - Remove inline data derivation logic from the screen
  - Render CalendarHeatmap, streak counter, trend line chart, tasks-by-list bar chart, due-date overview, steps progress sections
  - Render skeleton placeholders while `loading` is true
  - Render error message with retry button when `error` is set
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_

  - [x]* 12.1 Write unit test for AnalysisScreen error/retry UI
    - Verify retry button is rendered when `useAnalysisData` returns an error
    - _Requirements: 5.8_

- [x] 13. Update `TasksScreen` with pagination, FAB, SortableTaskItem, and useQueuedMutation
  - Replace inline "add task" trigger with `FloatingActionButton` in `mobile-app/src/screens/TasksScreen.tsx`
  - Replace task row with `SortableTaskItem`; wire `onDragEnd` to `PATCH /tasks/:id` with updated `order`
  - On reorder failure, revert list to pre-drag order and display error alert
  - Integrate `usePagination` with default page size 25; render pagination controls (Previous, Next, current/total) below the list
  - Scroll to top of task list on page change
  - Reset to page 1 on search query or sort option change
  - Use `useQueuedMutation` for task completion toggle
  - _Requirements: 7.5, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 9.4, 10.2, 10.3, 10.4_

- [x] 14. Update `TaskDetailsScreen` to use `useQueuedMutation`
  - Replace direct mutation calls with `useQueuedMutation` for all task field update mutations in `mobile-app/src/screens/TaskDetailsScreen.tsx`
  - _Requirements: 7.6_

- [x] 15. Update `ListsScreen` with share icon and `ShareListModal`
  - Add share icon button to each list row in `mobile-app/src/screens/ListsScreen.tsx`
  - Wire icon to open `ShareListModal` for the selected list
  - _Requirements: 6.6_

- [x] 16. Update `ProfileScreen` with email reminders toggle
  - Add "Email Reminders" toggle to `mobile-app/src/screens/ProfileScreen.tsx`
  - Read initial value from `user.notificationFrequency` (on for non-NONE, off for NONE)
  - On enable: call `PATCH /me` with a non-NONE frequency
  - On disable: call `PATCH /me` with `NONE`
  - On failure: revert toggle and display inline error
  - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.6_

  - [ ]* 16.1 Write property test for email reminders toggle round-trip (Property 5)
    - **Property 5: Email reminders toggle round-trip**
    - **Validates: Requirements 3.2, 3.3**

  - [ ]* 16.2 Write property test for profile screen reflects server preference (Property 6)
    - **Property 6: Profile screen reflects server preference**
    - **Validates: Requirements 3.5**

- [x] 17. Update `LoginScreen` with resend verification option
  - Add "Resend verification email" option to `mobile-app/src/screens/LoginScreen.tsx` when the user's email is unverified
  - Wire to `POST /auth/resend-verification`
  - _Requirements: 4.6_

- [x] 18. Wire `useNotifications` into `MainTabs`
  - Invoke `useNotifications()` once at the root of the authenticated navigation tree (inside `MainTabs`)
  - _Requirements: 11.4_

- [x] 19. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use **fast-check** with a minimum of 100 iterations per property
- Checkpoints ensure incremental validation before moving to the next layer
