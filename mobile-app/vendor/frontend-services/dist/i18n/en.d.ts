declare const _default: {
    readonly nav: {
        readonly lists: "Lists";
        readonly analysis: "Analytics";
        readonly profile: "Profile";
        readonly logout: "Logout";
        readonly language: "Language";
        readonly analytics: "Analytics";
        readonly theme: {
            readonly light: "Light";
            readonly dark: "Dark";
            readonly auto: "Auto";
        };
        readonly trash: "Trash";
        readonly allLists: "My Lists";
    };
    readonly languageNames: {
        readonly en: "English";
        readonly he: "Hebrew";
    };
    readonly common: {
        readonly cancel: "Cancel";
        readonly save: "Save";
        readonly delete: "Delete";
        readonly close: "Close";
        readonly create: "Create";
        readonly loading: "Loading...";
        readonly unknownError: "Unknown error";
        readonly errorOccurred: "An error occurred";
        readonly retry: "Retry";
        readonly edit: "Edit";
    };
    readonly login: {
        readonly title: "Sign in to Horizon Tasks";
        readonly emailPlaceholder: "Email address";
        readonly passwordPlaceholder: "Password";
        readonly signIn: "Sign in";
        readonly signingIn: "Signing in...";
        readonly showPassword: "Show password";
        readonly hidePassword: "Hide password";
        readonly failed: "Login failed. Please try again.";
        readonly notVerified: "Your email is not verified.";
        readonly resendVerification: "Resend verification link";
        readonly verificationResent: "Verification email sent!";
        readonly verificationFailed: "Failed to send verification email.";
    };
    readonly auth: {
        readonly verifyEmail: {
            readonly title: "Verifying Email";
            readonly success: "Email verified successfully!";
            readonly failed: "Verification failed. The link may be expired.";
            readonly backToLogin: "Back to Login";
        };
    };
    readonly lists: {
        readonly title: "Todo Lists";
        readonly empty: "No lists found. Create your first list!";
        readonly createFab: "Create new list";
        readonly loadFailed: "Failed to load lists";
        readonly createFailed: "Failed to create list";
        readonly done: "Done";
        readonly form: {
            readonly nameLabel: "Name";
            readonly typeLabel: "Type";
            readonly namePlaceholder: "e.g. Groceries";
            readonly tip: "Tip: system “Finished” list is managed automatically.";
            readonly behaviorLabel: "Task Behavior";
            readonly behaviorRecurring: "Recurring";
            readonly behaviorOneOff: "One-off";
            readonly policyLabel: "Completion Policy";
            readonly policyKeep: "Keep tasks";
            readonly policyDelete: "Delete forever";
        };
    };
    readonly tasks: {
        readonly backToLists: "Back to Lists";
        readonly defaultTitle: "Tasks";
        readonly renameTitle: "Click to rename";
        readonly deleteList: "Delete list";
        readonly deleteListConfirm: "Delete list \"{{name}}\"? This will delete all tasks in this list.";
        readonly createFab: "Create new task";
        readonly empty: "No tasks found.";
        readonly loadFailed: "Failed to load tasks";
        readonly createFailed: "Failed to create task";
        readonly deleteFailed: "Failed to delete task";
        readonly taskDeleted: "Task deleted";
        readonly listUpdated: "List updated";
        readonly listUpdateFailed: "Failed to update list";
        readonly listDeleted: "List deleted";
        readonly listDeleteFailed: "Failed to delete list";
        readonly selectMultiple: "Select Multiple";
        readonly deleteSelected: "Delete";
        readonly deleteSelectedConfirm: "Delete {{count}} task{{plural}}?";
        readonly unknownList: "Unknown List";
        readonly oneOffTasks: "One-off Tasks";
        readonly recurringTasks: "Recurring Tasks";
        readonly form: {
            readonly descriptionLabel: "Description";
            readonly descriptionPlaceholder: "e.g. Buy milk";
        };
        readonly deleteTaskConfirm: "Delete task \"{{description}}\"?";
        readonly restore: "Restore";
        readonly restoreConfirm: "Restore task \"{{description}}\" to its original list?";
        readonly restored: "Task restored";
        readonly restoreFailed: "Failed to restore task";
        readonly deleteForever: "Delete forever";
        readonly deleteForeverConfirm: "Delete task \"{{description}}\" forever? This cannot be undone.";
        readonly deletedForever: "Task deleted forever";
        readonly deleteForeverFailed: "Failed to delete task forever";
    };
    readonly taskDetails: {
        readonly backToTasks: "Back to Tasks";
        readonly clickToEdit: "Click to edit";
        readonly loadFailed: "Failed to load task";
        readonly notFound: "Task not found";
        readonly updateTaskFailed: "Failed to update task";
        readonly updateStepFailed: "Failed to update step";
        readonly addStepFailed: "Failed to add step";
        readonly deleteStepFailed: "Failed to delete step";
        readonly deleteStepConfirm: "Delete step \"{{description}}\"?";
        readonly taskUpdated: "Task updated";
        readonly stepUpdated: "Step updated";
        readonly stepAdded: "Step added";
        readonly stepDeleted: "Step deleted";
        readonly stepsTitle: "Steps";
        readonly noSteps: "No steps yet.";
        readonly addStepFab: "Add step";
        readonly dueDate: "Due Date";
        readonly descriptionRequired: "Description is required";
        readonly form: {
            readonly descriptionLabel: "Description";
            readonly descriptionPlaceholder: "e.g. Call the supplier";
        };
        readonly reminders: {
            readonly title: "Reminders";
            readonly add: "Add Reminder";
            readonly none: "No reminders set";
            readonly everyDay: "Every day";
            readonly daysBefore: "{{days}} days before";
            readonly atTime: "at {{time}}";
        };
    };
    readonly profile: {
        readonly title: "Profile";
        readonly notAuthenticated: "Not authenticated.";
        readonly email: "Email";
        readonly name: "Name";
        readonly emailVerified: "Email Verified";
        readonly yes: "Yes";
        readonly no: "No";
        readonly memberSince: "Member Since";
        readonly about: "About";
        readonly version: "Version";
        readonly credits: "Credits";
        readonly creditsValue: "OfekLabs";
        readonly sourceCode: "Source code";
        readonly openRepo: "Open repo";
        readonly proAccount: "Pro Account";
        readonly profilePicture: "Profile Picture";
        readonly trashRetention: {
            readonly title: "Trash Retention";
            readonly description: "Choose how long items stay in the trash before being deleted forever.";
            readonly days: "{{count}} days";
            readonly updateSuccess: "Trash retention updated";
            readonly updateFailed: "Failed to update trash retention";
        };
    };
    readonly footer: {
        readonly allRightsReserved: "All rights reserved.";
    };
    readonly analysis: {
        readonly title: "Analytics";
        readonly totalLists: "Total Lists";
        readonly totalTasks: "Total Tasks";
        readonly completed: "Completed";
        readonly completionRate: "Completion Rate";
        readonly completionStatus: "Completion Status";
        readonly pending: "Pending";
        readonly dailyStreak: "Daily Streak";
        readonly dailyActivity: "Daily Activity";
        readonly tasksByListChart: "Tasks by List";
        readonly completionTrends: "Completion Trends";
        readonly dueDateOverview: "Due Date Overview";
        readonly overdue: "Overdue";
        readonly dueToday: "Due Today";
        readonly dueThisWeek: "Due This Week";
        readonly withDueDates: "With Due Dates";
        readonly stepsProgress: "Steps Progress";
        readonly tasksWithSteps: "Tasks with Steps";
        readonly stepsCompleted: "Steps Completed";
        readonly stepsCompletion: "Steps Completion";
        readonly loadListsFailed: "Failed to load lists";
        readonly loadTasksFailed: "Failed to load tasks";
        readonly retryLists: "Retry Loading Lists";
        readonly retryTasks: "Retry Loading Tasks";
        readonly insightsDescription: "Insights and statistics";
    };
    readonly sharing: {
        readonly title: "Share List";
        readonly shareWith: "Share with";
        readonly emailPlaceholder: "Enter user email...";
        readonly role: "Role";
        readonly roles: {
            readonly VIEWER: "Viewer";
            readonly EDITOR: "Editor";
        };
        readonly shareButton: "Share";
        readonly sharedWith: "Shared with";
        readonly noShares: "Not shared with anyone yet";
        readonly unshare: "Unshare";
        readonly shareFailed: "Failed to share list";
        readonly unshareFailed: "Failed to unshare list";
        readonly unshareConfirm: "Stop sharing with {{email}}?";
        readonly alreadyShared: "This list is already shared with this user";
    };
};
export default _default;
