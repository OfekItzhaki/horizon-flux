export declare const resources: {
    readonly en: {
        readonly translation: {
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
    };
    readonly he: {
        readonly translation: {
            readonly nav: {
                readonly lists: "רשימות";
                readonly analysis: "אנליטיקה";
                readonly profile: "פרופיל";
                readonly logout: "התנתקות";
                readonly language: "שפה";
                readonly analytics: "אנליטיקה";
                readonly theme: {
                    readonly light: "בהיר";
                    readonly dark: "כהה";
                    readonly auto: "אוטומטי";
                };
                readonly trash: "סל מיחזור";
                readonly allLists: "הרשימות שלי";
            };
            readonly languageNames: {
                readonly en: "English";
                readonly he: "עברית";
            };
            readonly common: {
                readonly cancel: "ביטול";
                readonly save: "שמירה";
                readonly delete: "מחיקה";
                readonly close: "סגירה";
                readonly create: "יצירה";
                readonly loading: "טוען...";
                readonly unknownError: "שגיאה לא ידועה";
                readonly errorOccurred: "אירעה שגיאה";
                readonly retry: "נסה שוב";
                readonly edit: "ערוך";
            };
            readonly login: {
                readonly title: "התחברות ל-Horizon Tasks";
                readonly emailPlaceholder: "כתובת אימייל";
                readonly passwordPlaceholder: "סיסמה";
                readonly signIn: "התחבר";
                readonly signingIn: "מתחבר...";
                readonly showPassword: "הצג סיסמה";
                readonly hidePassword: "הסתר סיסמה";
                readonly failed: "ההתחברות נכשלה. נסה שוב.";
                readonly notVerified: "האימייל שלך עדיין לא מאומת.";
                readonly resendVerification: "שלח שוב קישור אימות";
                readonly verificationResent: "אימייל אימות נשלח בהצלחה!";
                readonly verificationFailed: "שליחת אימייל אימות נכשלה.";
            };
            readonly auth: {
                readonly verifyEmail: {
                    readonly title: "מאמת אימייל";
                    readonly success: "האימייל אומת בהצלחה!";
                    readonly failed: "האימות נכשל. ייתכן שהקישור פג תוקף.";
                    readonly backToLogin: "חזרה להתחברות";
                };
            };
            readonly lists: {
                readonly title: "רשימות";
                readonly manageAccount: "נהל הגדרות חשבון";
                readonly empty: "לא נמצאו רשימות. צור את הרשימה הראשונה שלך!";
                readonly createFab: "צור רשימה חדשה";
                readonly loadFailed: "טעינת הרשימות נכשלה";
                readonly createFailed: "יצירת הרשימה נכשלה";
                readonly done: "הושלמו";
                readonly form: {
                    readonly nameLabel: "שם";
                    readonly typeLabel: "סוג";
                    readonly namePlaceholder: "לדוגמה: קניות";
                    readonly tip: "טיפ: רשימת \"Finished\" מנוהלת אוטומטית על ידי המערכת.";
                    readonly behaviorLabel: "התנהגות משימות";
                    readonly behaviorRecurring: "חוזרות";
                    readonly behaviorOneOff: "חד פעמיות";
                    readonly policyLabel: "מדיניות סיום";
                    readonly policyKeep: "השאר משימות";
                    readonly policyDelete: "מחק לצמיתות";
                };
            };
            readonly tasks: {
                readonly backToLists: "חזרה לרשימות";
                readonly defaultTitle: "משימות";
                readonly renameTitle: "לחץ כדי לשנות שם";
                readonly deleteList: "מחק רשימה";
                readonly deleteListConfirm: "למחוק את הרשימה \"{{name}}\"? פעולה זו תמחק את כל המשימות ברשימה.";
                readonly createFab: "צור משימה חדשה";
                readonly empty: "לא נמצאו משימות.";
                readonly loadFailed: "טעינת המשימות נכשלה";
                readonly createFailed: "יצירת המשימה נכשלה";
                readonly deleteFailed: "מחיקת המשימה נכשלה";
                readonly taskDeleted: "המשימה נמחקה";
                readonly listUpdated: "הרשימה עודכנה";
                readonly listUpdateFailed: "עדכון הרשימה נכשל";
                readonly listDeleted: "הרשימה נמחקה";
                readonly listDeleteFailed: "מחיקת הרשימה נכשלה";
                readonly selectMultiple: "בחר מספר";
                readonly deleteSelected: "מחק";
                readonly deleteSelectedConfirm: "למחוק {{count}} משימה{{plural}}?";
                readonly unknownList: "רשימה לא ידועה";
                readonly oneOffTasks: "משימות חד פעמיות";
                readonly recurringTasks: "משימות חוזרות";
                readonly form: {
                    readonly descriptionLabel: "תיאור";
                    readonly descriptionPlaceholder: "לדוגמה: לקנות חלב";
                };
                readonly deleteTaskConfirm: "למחוק את המשימה \"{{description}}\"?";
                readonly restore: "שחזור";
                readonly restoreConfirm: "לשחזר את המשימה \"{{description}}\" לרשימה המקורית?";
                readonly restored: "המשימה שוחזרה";
                readonly restoreFailed: "שחזור המשימה נכשל";
                readonly deleteForever: "מחיקה לצמיתות";
                readonly deleteForeverConfirm: "למחוק את המשימה \"{{description}}\" לצמיתות? לא ניתן לבטל פעולה זו.";
                readonly deletedForever: "המשימה נמחקה לצמיתות";
                readonly deleteForeverFailed: "מחיקה לצמיתות נכשלה";
            };
            readonly taskDetails: {
                readonly backToTasks: "חזרה למשימות";
                readonly clickToEdit: "לחץ כדי לערוך";
                readonly loadFailed: "טעינת המשימה נכשלה";
                readonly notFound: "המשימה לא נמצאה";
                readonly updateTaskFailed: "עדכון המשימה נכשל";
                readonly updateStepFailed: "עדכון השלב נכשל";
                readonly addStepFailed: "הוספת השלב נכשלה";
                readonly deleteStepFailed: "מחיקת השלב נכשלה";
                readonly deleteStepConfirm: "למחוק את השלב \"{{description}}\"?";
                readonly taskUpdated: "המשימה עודכנה";
                readonly stepUpdated: "השלב עודכן";
                readonly stepAdded: "השלב נוסף";
                readonly stepDeleted: "השלב נמחק";
                readonly stepsTitle: "שלבים";
                readonly noSteps: "אין שלבים עדיין.";
                readonly addStepFab: "הוסף שלב";
                readonly dueDate: "תאריך יעד";
                readonly descriptionRequired: "תיאור נדרש";
                readonly form: {
                    readonly descriptionLabel: "תיאור";
                    readonly descriptionPlaceholder: "לדוגמה: להתקשר לספק";
                };
                readonly reminders: {
                    readonly title: "תזכורות";
                    readonly add: "הוסף תזכורת";
                    readonly none: "אין תזכורות";
                    readonly everyDay: "בכל יום";
                    readonly daysBefore: "{{days}} ימים לפני";
                    readonly atTime: "בשעה {{time}}";
                    readonly location: "מיקום";
                    readonly locationPlaceholder: "הזן מקום או כתובת...";
                    readonly configure: "הגדר תזכורת";
                    readonly frequency: "תדירות";
                    readonly dateOption: "אינטרוול";
                    readonly customDate: "בחר תאריך";
                    readonly dayOfWeek: "יום בשבוע";
                    readonly enableAlarm: "התראת Push";
                    readonly alarmDesc: "הפעל התראה חזקה בזמן שנקבע";
                };
            };
            readonly profile: {
                readonly title: "פרופיל";
                readonly notAuthenticated: "לא מחובר.";
                readonly email: "אימייל";
                readonly name: "שם";
                readonly emailVerified: "אימות אימייל";
                readonly yes: "כן";
                readonly no: "לא";
                readonly memberSince: "חבר מאז";
                readonly about: "אודות";
                readonly version: "גרסה";
                readonly credits: "קרדיטים";
                readonly creditsValue: "OfekLabs";
                readonly sourceCode: "קוד מקור";
                readonly openRepo: "פתח מאגר";
                readonly proAccount: "חשבון Pro";
                readonly profilePicture: "תמונת פרופיל";
                readonly trashRetention: {
                    readonly title: "שמירת פריטים בסל המיחזור";
                    readonly description: "בחר כמה זמן פריטים יישארו בסל המיחזור לפני שיימחקו לצמיתות.";
                    readonly days: "{{count}} ימים";
                    readonly updateSuccess: "הגדרת שמירת הפריטים עודכנה";
                    readonly updateFailed: "עדכון הגדרת שמירת הפריטים נכשל";
                };
            };
            readonly footer: {
                readonly allRightsReserved: "כל הזכויות שמורות.";
            };
            readonly analysis: {
                readonly title: "אנליטיקה";
                readonly totalLists: "סך הכל רשימות";
                readonly totalTasks: "סך הכל משימות";
                readonly completed: "הושלמו";
                readonly completionRate: "שיעור השלמה";
                readonly completionStatus: "סטטוס השלמה";
                readonly pending: "ממתינות";
                readonly dailyStreak: "רצף יומי";
                readonly dailyActivity: "פעילות יומית";
                readonly tasksByListChart: "משימות לפי רשימה";
                readonly completionTrends: "מגמות השלמה";
                readonly dueDateOverview: "סקירת תאריכי יעד";
                readonly overdue: "באיחור";
                readonly dueToday: "להיום";
                readonly dueThisWeek: "השבוע";
                readonly withDueDates: "עם תאריך יעד";
                readonly stepsProgress: "התקדמות שלבים";
                readonly tasksWithSteps: "משימות עם שלבים";
                readonly stepsCompleted: "שלבים שהושלמו";
                readonly stepsCompletion: "השלמת שלבים";
                readonly loadListsFailed: "טעינת הרשימות נכשלה";
                readonly loadTasksFailed: "טעינת המשימות נכשלה";
                readonly retryLists: "נסה שוב טעינת רשימות";
                readonly retryTasks: "נסה שוב טעינת משימות";
                readonly insightsDescription: "תובנות וסטטיסטיקות";
            };
            readonly sharing: {
                readonly title: "שיתוף רשימה";
                readonly shareWith: "שתף עם";
                readonly emailPlaceholder: "הזן אימייל של המשתמש...";
                readonly role: "תפקיד";
                readonly roles: {
                    readonly VIEWER: "צופה";
                    readonly EDITOR: "עורך";
                };
                readonly shareButton: "שתף";
                readonly sharedWith: "משותף עם";
                readonly noShares: "הרשימה לא משותפת עם אף אחד עדיין";
                readonly unshare: "בטל שיתוף";
                readonly shareFailed: "שיתוף הרשימה נכשל";
                readonly unshareFailed: "ביטול השיתוף נכשל";
                readonly unshareConfirm: "להפסיק לשתף עם {{email}}?";
                readonly alreadyShared: "הרשימה כבר משותפת עם משתמש זה";
            };
        };
    };
};
export type SupportedLanguage = keyof typeof resources;
export declare const supportedLanguages: SupportedLanguage[];
export declare const defaultLanguage: SupportedLanguage;
export declare function normalizeLanguage(lng: string | undefined | null): SupportedLanguage;
export declare function isRtlLanguage(lng: string | undefined | null): boolean;
