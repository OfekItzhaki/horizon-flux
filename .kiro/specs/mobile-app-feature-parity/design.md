# Design Document: Mobile App Feature Parity

## Overview

This document describes the technical design for bringing the React Native / Expo mobile app to full feature parity with the web app. The work spans eleven areas: push notification registration and delivery, email notification triggering, email verification flow, analytics screen parity, list sharing UI, offline-resilient mutations, task list pagination, and two missing UI components (FloatingActionButton, SortableTaskItem), unified under a single notification initialisation hook.

The backend (NestJS) already exposes all required endpoints. The mobile app has `expo-notifications` installed and partially wired. The design focuses on completing the wiring, extracting reusable hooks, and adding missing components — with minimal disruption to existing code.

---

## Architecture

The feature set maps cleanly onto four layers:

```
┌─────────────────────────────────────────────────────────┐
│  Screens                                                │
│  AnalysisScreen  TasksScreen  ListsScreen  LoginScreen  │
│  TaskDetailsScreen  VerifyEmailScreen (new)             │
├─────────────────────────────────────────────────────────┤
│  Hooks                                                  │
│  useNotifications (new)   useAnalysisData (new)         │
│  useQueuedMutation (new)  usePagination (new)           │
│  useTaskList (existing)                                 │
├─────────────────────────────────────────────────────────┤
│  Components                                             │
│  FloatingActionButton (new)  SortableTaskItem (new)     │
│  ShareListModal (new)                                   │
├─────────────────────────────────────────────────────────┤
│  Services / Utils                                       │
│  notifications.service (extend)  users.service (extend) │
│  sharing.service (existing)  auth.service (existing)    │
└─────────────────────────────────────────────────────────┘
```

Data flow follows the existing pattern: screens consume hooks, hooks call services, services call the API client. React Query is the caching layer for server state; Zustand stores hold auth and theme state.

### Deep-Link Routing

The `AppNavigator` linking config is extended to include the `verify-email/:token` route, which maps to the new `VerifyEmailScreen`. The screen is placed in the unauthenticated stack so it is reachable before login.

```
tasks-management://verify-email/:token  →  VerifyEmailScreen
```

---

## Components and Interfaces

### `useNotifications` hook

Single entry point for all notification concerns. Invoked once inside `MainTabs`.

```typescript
function useNotifications(): void
```

Responsibilities:
1. On mount (authenticated): call `requestNotificationPermissions`, obtain push token, `POST /me/push-token`.
2. On mount (authenticated + tasks loaded): call `rescheduleAllReminders`.
3. On logout: call `Notifications.cancelAllScheduledNotificationsAsync`.
4. Expo Go guard: skip all of the above and log a dev warning.
5. Retry logic: if push-token registration fails, retry once after 5 s.

### `useAnalysisData` hook

Extracts all data derivation from `AnalysisScreen`.

```typescript
interface AnalysisData {
  heatmapData: Record<string, number>;   // ISO date → completion count, trailing 90 days
  streak: number;                         // consecutive-day completion streak
  trendData: { date: string; count: number }[];  // last 30 days
  tasksByList: { listName: string; completed: number; pending: number }[];
  dueDateOverview: { overdue: number; dueToday: number; dueThisWeek: number; withDueDate: number };
  stepsProgress: { tasksWithSteps: number; completedSteps: number; totalSteps: number };
  loading: boolean;
  error: Error | null;
  retry: () => void;
}

function useAnalysisData(): AnalysisData
```

Fetches lists and tasks (with steps) via React Query, then derives all stats. The `AnalysisScreen` becomes a pure rendering component.

### `useQueuedMutation` hook

Wraps React Query's `useMutation` to guarantee synchronous optimistic updates and deduplicate concurrent identical calls.

```typescript
interface QueuedMutationOptions<TData, TError, TVariables, TContext> 
  extends UseMutationOptions<TData, TError, TVariables, TContext> {
  mutationKey: QueryKey;
}

function useQueuedMutation<TData, TError, TVariables, TContext>(
  options: QueuedMutationOptions<TData, TError, TVariables, TContext>
): UseMutationResult<TData, TError, TVariables, TContext>
```

Deduplication: an in-flight set keyed by `JSON.stringify(variables)` prevents duplicate API calls for the same payload while one is pending.

### `usePagination` hook

Pure client-side pagination over a pre-filtered/sorted array.

```typescript
interface PaginationResult<T> {
  page: T[];
  currentPage: number;
  totalPages: number;
  goToPage: (n: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

function usePagination<T>(items: T[], pageSize?: number): PaginationResult<T>
```

Default `pageSize` is 25. Page resets to 1 whenever `items` reference changes (i.e., when search or sort changes upstream).

### `FloatingActionButton` component

```typescript
interface FloatingActionButtonProps {
  onPress: () => void;
  ariaLabel: string;
  disabled?: boolean;
  icon?: React.ReactNode;  // defaults to "+" text
}
```

Positioned with `position: 'absolute'`, `bottom` offset accounts for the tab bar height via `useSafeAreaInsets`. Renders with `opacity: 0.4` and `pointerEvents: 'none'` when `disabled`.

### `SortableTaskItem` component

```typescript
interface SortableTaskItemProps {
  task: Task;
  onPress: () => void;
  onToggle: () => void;
  onDragEnd: (newOrder: number) => void;
}
```

Uses React Native's `PanResponder` (or `react-native-reanimated` if already available) for drag gesture. A long-press activates drag mode; releasing calls `onDragEnd` with the computed new order index. Displays a `≡` drag handle icon on the leading edge.

### `ShareListModal` component

```typescript
interface ShareListModalProps {
  listId: string;
  visible: boolean;
  onClose: () => void;
}
```

Internal state: `email`, `role` (EDITOR | VIEWER), `shares[]`, `loading`, `error`. Fetches existing shares on open. Submit calls `sharingService.shareList`; remove calls `sharingService.unshareList` after an `Alert.alert` confirmation. Errors are displayed inline without closing the modal.

### `VerifyEmailScreen`

New screen in the unauthenticated stack. Reads `token` from route params (populated by deep link). On mount, calls `authService.verifyEmail(token)`. Success → 3-second countdown → navigate to `Auth`. Error → error state with "Back to Login" button.

### `users.service` extension

Add `registerPushToken(token: string): Promise<void>` that calls `POST /me/push-token`.

### `ProfileScreen` extension

Add an "Email Reminders" toggle that reads `user.notificationFrequency` and calls `usersService.update(user.id, { notificationFrequency })`. On failure, revert toggle and show error.

---

## Data Models

No new backend entities are required. The relevant existing types are:

```typescript
// Already in types/index.ts
interface User {
  notificationFrequency: NotificationFrequency;  // NONE | DAILY | WEEKLY
  emailVerified: boolean;
}

interface Task {
  completedAt: string | null;   // used for heatmap / streak computation
  completionCount: number;
  order: number;                // used for drag-to-reorder
}
```

### Heatmap data shape

```typescript
// Derived by useAnalysisData
type HeatmapData = Record<string, number>;  // { "2025-01-15": 3, "2025-01-16": 1, ... }
```

### Pagination state

```typescript
interface PaginationState {
  currentPage: number;   // 1-indexed
  pageSize: number;      // default 25
}
```

### Push token registration payload

```typescript
interface PushTokenDto {
  token: string;
  platform: 'ios' | 'android';
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Push notification registration round-trip

*For any* authenticated user in a non-Expo-Go environment, calling the notification initialisation sequence should result in exactly one call to `POST /me/push-token` with the token returned by `getExpoPushTokenAsync`.

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Push token registration retry on failure

*For any* failed `POST /me/push-token` call, the system should retry exactly once and then stop, never making more than two total attempts.

**Validates: Requirements 1.5**

### Property 3: Notification content contains task title

*For any* task and reminder configuration, the scheduled notification content's `title` field should contain the task's description string.

**Validates: Requirements 2.1**

### Property 4: Notification tap navigates to correct task

*For any* notification response whose `data.taskId` is set, the response handler should call `navigation.navigate('TaskDetails', { taskId })` with that exact taskId.

**Validates: Requirements 2.3**

### Property 5: Email reminders toggle round-trip

*For any* user, enabling then disabling the "Email Reminders" toggle should result in two `PATCH /me` calls — first with a non-`NONE` frequency, then with `NONE` — and the final stored preference should be `NONE`.

**Validates: Requirements 3.2, 3.3**

### Property 6: Profile screen reflects server preference

*For any* user whose `notificationFrequency` is returned by `GET /me`, the toggle rendered on the profile screen should reflect that value (on for non-NONE, off for NONE).

**Validates: Requirements 3.5**

### Property 7: Email verification API call on valid token

*For any* non-empty token string passed to `VerifyEmailScreen`, the screen should call `POST /auth/verify-email/:token` exactly once on mount.

**Validates: Requirements 4.2**

### Property 8: Heatmap covers exactly 90 days

*For any* set of tasks with `completedAt` timestamps, the heatmap data returned by `useAnalysisData` should contain entries only for dates within the trailing 90-day window, and every day in that window should have an entry (zero or positive).

**Validates: Requirements 5.1**

### Property 9: Streak computation correctness

*For any* sequence of task completion dates, the streak value returned by `useAnalysisData` should equal the length of the longest suffix of consecutive calendar days ending on today (or yesterday) that all contain at least one completion.

**Validates: Requirements 5.2**

### Property 10: Trend data has exactly 30 entries

*For any* task dataset, the `trendData` array returned by `useAnalysisData` should have exactly 30 elements, one per day for the last 30 days, in ascending date order.

**Validates: Requirements 5.3**

### Property 11: Tasks-by-list grouping is exhaustive and correct

*For any* set of tasks and lists, the `tasksByList` array from `useAnalysisData` should contain one entry per list, and the sum of all `completed + pending` counts should equal the total number of tasks.

**Validates: Requirements 5.4**

### Property 12: Due-date overview counts are correct

*For any* set of tasks with due dates, the `dueDateOverview` counts from `useAnalysisData` should satisfy: `overdue + dueToday + (dueThisWeek - dueToday) + future = withDueDate` (no task is double-counted or omitted).

**Validates: Requirements 5.5**

### Property 13: Steps progress counts are correct

*For any* set of tasks with steps, the `stepsProgress` from `useAnalysisData` should satisfy: `completedSteps ≤ totalSteps` and `tasksWithSteps ≤ total task count`.

**Validates: Requirements 5.6**

### Property 14: Share submission calls correct API

*For any* valid email and role, submitting the `ShareListModal` form should call `POST /list-shares/todo-list/:id` with the email and role in the request body.

**Validates: Requirements 6.2**

### Property 15: Existing shares are displayed

*For any* list, opening `ShareListModal` should render one row per share returned by `GET /list-shares/todo-list/:id`.

**Validates: Requirements 6.3**

### Property 16: Optimistic update precedes API call

*For any* mutation invoked via `useQueuedMutation`, the `onMutate` callback (optimistic update) should be called before the underlying `mutationFn` promise resolves.

**Validates: Requirements 7.1, 7.2**

### Property 17: Deduplication of identical concurrent mutations

*For any* N ≥ 2 rapid calls to `useQueuedMutation` with identical variable payloads while the first call is in-flight, only one API call should be dispatched.

**Validates: Requirements 7.3**

### Property 18: Pagination slice correctness

*For any* array of N items, page number P (1-indexed), and page size S, `usePagination` should return exactly `min(S, N - (P-1)*S)` items starting at index `(P-1)*S`.

**Validates: Requirements 8.1**

### Property 19: Page resets to 1 on filter or sort change

*For any* `TasksScreen` state where `currentPage > 1`, changing the search query or sort option should reset `currentPage` to 1.

**Validates: Requirements 8.6, 8.7**

### Property 20: FloatingActionButton disabled state

*For any* `FloatingActionButton` rendered with `disabled={true}`, pressing it should not invoke `onPress`, and the component's opacity should be less than 1.

**Validates: Requirements 9.2, 9.3**

### Property 21: Drag-to-reorder persists new order

*For any* task reorder operation that completes successfully, `PATCH /tasks/:id` should be called with the `order` field set to the task's new position index.

**Validates: Requirements 10.3**

### Property 22: useNotifications triggers registration when authenticated

*For any* authenticated user in a non-Expo-Go environment, mounting `useNotifications` should trigger the push token registration sequence (permission request → token fetch → backend registration).

**Validates: Requirements 11.2**

### Property 23: useNotifications reschedules reminders on startup

*For any* authenticated user with at least one task, mounting `useNotifications` should call `rescheduleAllReminders` exactly once.

**Validates: Requirements 11.3**

### Property 24: useNotifications cancels notifications on logout

*For any* session where `useNotifications` is mounted, a logout event should result in `Notifications.cancelAllScheduledNotificationsAsync` being called.

**Validates: Requirements 11.5**

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| Push token registration fails | Retry once after 5 s; silently fail after second attempt |
| `PATCH /me` (email toggle) fails | Revert toggle to previous value; show inline error |
| `POST /auth/verify-email` fails | Show error state with "Back to Login" button |
| `POST /list-shares` or `DELETE /list-shares` fails | Show inline error in modal; keep modal open |
| `useQueuedMutation` API call fails | Call `onError` with original context for rollback |
| Drag-to-reorder `PATCH /tasks/:id` fails | Revert list to pre-drag order; show error alert |
| `useAnalysisData` fetch fails | Expose `error` field; `AnalysisScreen` shows retry button |
| Expo Go environment | All notification paths are no-ops; dev warning logged |

All API errors propagate through the existing `handleApiError` / `ApiError` utilities.

---

## Testing Strategy

### Dual approach

Both unit tests and property-based tests are required. Unit tests cover specific examples, integration points, and error conditions. Property tests verify universal correctness across randomised inputs.

### Property-based testing library

Use **fast-check** (`npm install --save-dev fast-check`), which integrates cleanly with Jest (already configured in the project).

Each property test runs a minimum of **100 iterations** (fast-check default). Tag format for each test:

```
// Feature: mobile-app-feature-parity, Property N: <property text>
```

### Property test mapping

| Property | Test file | fast-check arbitraries |
|---|---|---|
| 1 – Registration round-trip | `useNotifications.test.ts` | `fc.string()` for token |
| 2 – Retry on failure | `useNotifications.test.ts` | mock failure scenarios |
| 3 – Notification content | `notifications.service.test.ts` | `fc.record({ description: fc.string() })` |
| 4 – Tap navigation | `notifications.service.test.ts` | `fc.uuid()` for taskId |
| 5 – Email toggle round-trip | `ProfileScreen.test.tsx` | `fc.constantFrom('DAILY','WEEKLY')` |
| 6 – Profile reflects preference | `ProfileScreen.test.tsx` | `fc.constantFrom(...NotificationFrequency)` |
| 7 – Verify email API call | `VerifyEmailScreen.test.tsx` | `fc.string({ minLength: 1 })` |
| 8 – Heatmap 90-day window | `useAnalysisData.test.ts` | `fc.array(fc.record({ completedAt: fc.date() }))` |
| 9 – Streak correctness | `useAnalysisData.test.ts` | `fc.array(fc.date())` |
| 10 – Trend 30 entries | `useAnalysisData.test.ts` | `fc.array(fc.record({ completedAt: fc.date() }))` |
| 11 – Tasks-by-list exhaustive | `useAnalysisData.test.ts` | `fc.array(fc.record({ todoListId: fc.uuid() }))` |
| 12 – Due-date counts | `useAnalysisData.test.ts` | `fc.array(fc.record({ dueDate: fc.option(fc.date()) }))` |
| 13 – Steps counts | `useAnalysisData.test.ts` | `fc.array(fc.record({ steps: fc.array(...) }))` |
| 14 – Share API call | `ShareListModal.test.tsx` | `fc.emailAddress()`, `fc.constantFrom('EDITOR','VIEWER')` |
| 15 – Shares displayed | `ShareListModal.test.tsx` | `fc.array(fc.record({ userId: fc.uuid() }))` |
| 16 – Optimistic update order | `useQueuedMutation.test.ts` | `fc.anything()` for variables |
| 17 – Deduplication | `useQueuedMutation.test.ts` | `fc.integer({ min: 2, max: 10 })` for N |
| 18 – Pagination slice | `usePagination.test.ts` | `fc.array(fc.anything())`, `fc.nat()`, `fc.integer({ min: 1 })` |
| 19 – Page reset | `usePagination.test.ts` | `fc.string()` for query, `fc.constantFrom(sortOptions)` |
| 20 – FAB disabled | `FloatingActionButton.test.tsx` | `fc.boolean()` for disabled |
| 21 – Reorder persists | `SortableTaskItem.test.tsx` | `fc.array(fc.record({ id: fc.uuid() }))` |
| 22 – Registration on auth | `useNotifications.test.ts` | mock authenticated state |
| 23 – Reschedule on startup | `useNotifications.test.ts` | `fc.array(fc.record({ id: fc.uuid() }))` |
| 24 – Cancel on logout | `useNotifications.test.ts` | mock logout event |

### Unit tests

Focus on:
- Android notification channel configuration (Req 2.6, 2.7) — example test verifying channel names and importance levels
- Deep-link routing to `VerifyEmailScreen` (Req 4.1, 4.5) — example test with linking config
- `VerifyEmailScreen` error state (Req 4.4) — example test with API error mock
- `AnalysisScreen` error/retry UI (Req 5.8) — example test
- `ShareListModal` remove confirmation flow (Req 6.4) — example test
- `SortableTaskItem` drag handle presence (Req 10.5) — example test
- Pagination controls render when >25 tasks (Req 8.2) — example test
- Default page size of 25 (Req 8.3) — example test
