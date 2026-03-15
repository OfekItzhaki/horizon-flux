# Requirements Document

## Introduction

The mobile app (React Native / Expo) currently lags behind the web app in several areas. This feature brings the mobile app to full parity with the web app, with a primary focus on notification delivery (push notifications via Expo and email reminders triggered from the mobile client). Secondary gaps include: email verification flow, analytics/heatmap visualisation, list sharing UI, offline-resilient mutations, task list pagination, and missing UI components (FloatingActionButton, SortableTaskItem).

The backend (NestJS) already exposes all required endpoints. The mobile app has `expo-notifications` installed and partially wired. The goal is to complete the wiring and fill every identified gap.

---

## Glossary

- **Mobile_App**: The React Native / Expo application in `mobile-app/`.
- **Web_App**: The React (Vite) application in `web-app/`, used as the reference implementation.
- **Backend**: The NestJS API in `todo-backend/`, the authoritative source of truth for data and notification dispatch.
- **Push_Notification**: A device-level notification delivered via Expo's push notification infrastructure to the user's mobile device.
- **Email_Notification**: A reminder email dispatched by the Backend's email queue (BullMQ + email processor).
- **Notification_Service**: The module in `mobile-app/src/services/notifications.service.ts` responsible for scheduling and managing Push_Notifications.
- **Push_Token**: The Expo push token obtained from `expo-notifications` that uniquely identifies a device for Push_Notification delivery.
- **Reminder**: A user-configured schedule (daily, weekly, specific date, days-before-due) that triggers a notification.
- **Email_Verification_Flow**: The sequence of screens and API calls that confirm a user's email address after registration.
- **ShareListModal**: A modal UI component that allows a user to share a list with another user by email and manage existing shares.
- **QueuedMutation**: A mutation wrapper that applies optimistic updates immediately and defers the API call to the next event-loop tick, preventing UI blocking.
- **Pagination**: Client-side or server-assisted splitting of a task list into discrete pages with navigation controls.
- **CalendarHeatmap**: A visual grid showing task completion frequency per day over a rolling window.
- **FloatingActionButton**: A circular button fixed to the bottom-right of the screen used to trigger the primary action (e.g., add task).
- **SortableTaskItem**: A task list row that supports drag-to-reorder interaction.
- **AnalysisScreen**: The mobile screen equivalent of the web `AnalyticsPage`, showing task statistics and charts.
- **VerifyEmailScreen**: The mobile screen equivalent of the web `VerifyEmailPage`.

---

## Requirements

### Requirement 1: Push Notification Registration

**User Story:** As a mobile user, I want the app to register my device for push notifications when I log in, so that I receive timely task reminders on my device.

#### Acceptance Criteria

1. WHEN a user successfully authenticates, THE Mobile_App SHALL request push notification permission from the operating system.
2. WHEN push notification permission is granted, THE Notification_Service SHALL obtain a Push_Token from the Expo push notification service.
3. WHEN a Push_Token is obtained, THE Mobile_App SHALL send the Push_Token to the Backend via `POST /me/push-token` so the Backend can target the device.
4. IF the push notification permission is denied, THEN THE Mobile_App SHALL store the denial state locally and not re-request permission on subsequent app launches during the same session.
5. IF the Push_Token registration API call fails, THEN THE Mobile_App SHALL retry the registration once after a 5-second delay before silently failing.
6. WHILE the app is running in Expo Go, THE Notification_Service SHALL skip Push_Token registration and log a development-mode warning.

---

### Requirement 2: Push Notification Delivery and Handling

**User Story:** As a mobile user, I want to receive push notifications for my task reminders and be taken to the relevant task when I tap one, so that I can act on reminders immediately.

#### Acceptance Criteria

1. WHEN a Reminder fires, THE Notification_Service SHALL schedule a local Push_Notification using `expo-notifications` with the task title and reminder message as content.
2. WHEN the app is in the foreground and a Push_Notification arrives, THE Mobile_App SHALL display an in-app alert banner with the notification content.
3. WHEN a user taps a Push_Notification while the app is in the background or closed, THE Mobile_App SHALL navigate to the TaskDetailsScreen for the associated task.
4. WHEN the app starts after being closed, THE Notification_Service SHALL reschedule all active Reminders for the authenticated user by calling `GET /reminders/range` on the Backend.
5. IF a scheduled Push_Notification references a task that has since been completed or deleted, THEN THE Notification_Service SHALL cancel that Push_Notification.
6. THE Notification_Service SHALL configure an Android notification channel named "Task Reminders" with HIGH importance for Reminder notifications.
7. THE Notification_Service SHALL configure a separate Android notification channel named "Daily Tasks" with LOW importance for the daily summary notification.

---

### Requirement 3: Email Notification Triggering from Mobile

**User Story:** As a mobile user, I want to opt in to email reminders for my tasks, so that I receive reminder emails even when my device is offline or notifications are disabled.

#### Acceptance Criteria

1. THE Mobile_App SHALL display an "Email Reminders" toggle in the user's profile or reminder configuration UI.
2. WHEN a user enables the "Email Reminders" toggle, THE Mobile_App SHALL call `PATCH /me` to set `notificationFrequency` to a non-`NONE` value on the Backend.
3. WHEN a user disables the "Email Reminders" toggle, THE Mobile_App SHALL call `PATCH /me` to set `notificationFrequency` to `NONE` on the Backend.
4. WHEN a Reminder fires and the user's `notificationFrequency` is not `NONE`, THE Backend SHALL dispatch a reminder email via the email queue.
5. THE Mobile_App SHALL display the current email notification preference fetched from `GET /me` when the profile screen loads.
6. IF the `PATCH /me` call fails, THEN THE Mobile_App SHALL revert the toggle to its previous state and display an error message.

---

### Requirement 4: Email Verification Flow

**User Story:** As a new mobile user, I want to verify my email address from within the app, so that I can complete registration without switching to a browser.

#### Acceptance Criteria

1. THE Mobile_App SHALL include a VerifyEmailScreen that accepts a verification token from a deep link of the form `tasks-management://verify-email/:token`.
2. WHEN the VerifyEmailScreen loads with a valid token, THE Mobile_App SHALL call `POST /auth/verify-email/:token` and display a success state.
3. WHEN email verification succeeds, THE Mobile_App SHALL navigate to the LoginScreen after a 3-second delay.
4. IF the verification token is missing or the API call returns an error, THEN THE Mobile_App SHALL display an error state with a "Back to Login" button.
5. THE AppNavigator SHALL register the `verify-email/:token` deep-link route so the operating system can open the app directly to the VerifyEmailScreen.
6. WHEN a user is on the LoginScreen and their email is unverified, THE Mobile_App SHALL display a "Resend verification email" option that calls `POST /auth/resend-verification`.

---

### Requirement 5: Analytics Screen Parity

**User Story:** As a mobile user, I want to see the same analytics and visualisations as the web app, so that I have full insight into my task completion patterns on mobile.

#### Acceptance Criteria

1. THE AnalysisScreen SHALL display a CalendarHeatmap showing task completion counts for the trailing 90 days.
2. THE AnalysisScreen SHALL display a completion streak counter showing the current consecutive-day streak of task completions.
3. THE AnalysisScreen SHALL display a completion trend line chart covering the last 30 days.
4. THE AnalysisScreen SHALL display a tasks-by-list bar chart showing completed and pending counts per list.
5. THE AnalysisScreen SHALL display a due-date overview section with counts for overdue, due today, due this week, and tasks with due dates.
6. THE AnalysisScreen SHALL display a steps progress section with counts for tasks with steps, completed steps, and total steps.
7. WHEN data is loading, THE AnalysisScreen SHALL display skeleton placeholder elements in place of each chart and stat card.
8. IF data loading fails, THEN THE AnalysisScreen SHALL display an error message with a retry button.
9. THE Mobile_App SHALL extract analysis data computation into a `useAnalysisData` hook, mirroring the web app's `useAnalysisData` hook, so that the AnalysisScreen is not responsible for data derivation logic.

---

### Requirement 6: List Sharing UI

**User Story:** As a mobile user, I want to share my lists with other users and manage existing shares from within the app, so that I have the same collaboration capabilities as on the web.

#### Acceptance Criteria

1. THE Mobile_App SHALL include a ShareListModal component that allows a user to enter an email address and a role (EDITOR or VIEWER) to share a list.
2. WHEN a user submits the share form with a valid email, THE ShareListModal SHALL call `POST /list-shares/todo-list/:id` and display a success confirmation.
3. THE ShareListModal SHALL display a list of existing shares for the list, fetched from `GET /list-shares/todo-list/:id`.
4. WHEN a user taps the remove button on an existing share, THE ShareListModal SHALL prompt for confirmation and then call `DELETE /list-shares/todo-list/:id/user/:userId`.
5. IF a share or unshare API call fails, THEN THE ShareListModal SHALL display an error message without closing the modal.
6. THE ListsScreen SHALL include a share icon button on each list row that opens the ShareListModal for that list.
7. WHEN the ShareListModal is open, THE Mobile_App SHALL prevent interaction with the content behind the modal.

---

### Requirement 7: Offline-Resilient Mutations (useQueuedMutation)

**User Story:** As a mobile user, I want UI interactions like toggling task completion to feel instant even on a slow connection, so that the app remains responsive.

#### Acceptance Criteria

1. THE Mobile_App SHALL implement a `useQueuedMutation` hook that wraps React Query mutations to apply optimistic updates synchronously before dispatching the API call.
2. WHEN `useQueuedMutation` is invoked, THE Mobile_App SHALL apply the `onMutate` optimistic update in the same synchronous call before yielding to the event loop for the API request.
3. WHEN multiple rapid invocations of the same mutation key occur, THE `useQueuedMutation` hook SHALL deduplicate concurrent API calls for identical variable payloads.
4. IF an API call made via `useQueuedMutation` fails, THEN THE Mobile_App SHALL invoke the `onError` callback with the original context so the optimistic update can be rolled back.
5. THE TasksScreen SHALL use `useQueuedMutation` for task completion toggle mutations.
6. THE TaskDetailsScreen SHALL use `useQueuedMutation` for task field update mutations.

---

### Requirement 8: Task List Pagination

**User Story:** As a mobile user with large task lists, I want to navigate through tasks in pages, so that the app remains performant and the list is easy to browse.

#### Acceptance Criteria

1. THE Mobile_App SHALL implement a `usePagination` hook that accepts a flat array of items, a page number, and an items-per-page count, and returns the current page's items along with total page count and navigation helpers.
2. WHEN a task list contains more than 25 tasks, THE TasksScreen SHALL render pagination controls below the task list.
3. THE TasksScreen SHALL default to 25 tasks per page.
4. WHEN a user navigates to a new page, THE TasksScreen SHALL scroll to the top of the task list.
5. THE pagination controls SHALL display "Previous" and "Next" buttons and the current page number out of total pages.
6. WHEN a search query is active, THE TasksScreen SHALL reset to page 1 and paginate the filtered result set.
7. WHEN a sort option changes, THE TasksScreen SHALL reset to page 1.

---

### Requirement 9: FloatingActionButton Component

**User Story:** As a mobile user, I want a clearly visible button to add new tasks, so that the primary action is always accessible without scrolling.

#### Acceptance Criteria

1. THE Mobile_App SHALL implement a `FloatingActionButton` component that renders a circular button fixed to the bottom-right of the screen.
2. THE FloatingActionButton SHALL accept `onPress`, `ariaLabel`, and `disabled` props.
3. WHEN `disabled` is true, THE FloatingActionButton SHALL render with reduced opacity and not respond to press events.
4. THE TasksScreen SHALL replace its current inline "add task" trigger with the FloatingActionButton component.
5. THE FloatingActionButton SHALL be positioned above the bottom tab bar so it is not obscured by navigation chrome.

---

### Requirement 10: SortableTaskItem Component

**User Story:** As a mobile user, I want to reorder tasks by dragging them, so that I can prioritise my task list manually.

#### Acceptance Criteria

1. THE Mobile_App SHALL implement a `SortableTaskItem` component that wraps a task row with drag-handle support using a long-press gesture.
2. WHEN a user long-presses a task row, THE SortableTaskItem SHALL activate drag mode and allow the item to be repositioned within the list.
3. WHEN a drag operation completes, THE TasksScreen SHALL call `PATCH /tasks/:id` with the updated `order` field to persist the new position.
4. IF the reorder API call fails, THEN THE TasksScreen SHALL revert the list to its previous order and display an error message.
5. THE SortableTaskItem SHALL display a visible drag handle icon on the leading edge of each task row.

---

### Requirement 11: Notification Initialisation Hook

**User Story:** As a developer, I want a single hook that initialises all notification concerns on app startup, so that notification setup is not scattered across screens.

#### Acceptance Criteria

1. THE Mobile_App SHALL implement a `useNotifications` hook that mirrors the web app's `useNotifications` hook in responsibility.
2. WHEN a user is authenticated, THE `useNotifications` hook SHALL call `requestNotificationPermissions`, obtain a Push_Token, and register it with the Backend.
3. WHEN a user is authenticated and tasks are loaded, THE `useNotifications` hook SHALL call `rescheduleAllReminders` to restore scheduled Push_Notifications after an app restart.
4. THE `useNotifications` hook SHALL be invoked once at the root of the authenticated navigation tree (e.g., inside `MainTabs`).
5. WHEN a user logs out, THE `useNotifications` hook SHALL cancel all scheduled Push_Notifications for the session.

