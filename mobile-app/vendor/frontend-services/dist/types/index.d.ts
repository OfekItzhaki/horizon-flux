export declare enum NotificationFrequency {
    NONE = "NONE",
    DAILY = "DAILY",
    WEEKLY = "WEEKLY"
}
export interface User {
    id: string;
    email: string;
    name: string | null;
    profilePicture: string | null;
    emailVerified: boolean;
    notificationFrequency: NotificationFrequency;
    trashRetentionDays: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}
export interface CreateUserDto {
    email: string;
    password: string;
    name?: string;
    profilePicture?: string;
}
export interface UpdateUserDto {
    email?: string;
    name?: string;
    profilePicture?: string;
    password?: string;
    notificationFrequency?: NotificationFrequency;
    trashRetentionDays?: number;
}
export interface LoginDto {
    email: string;
    password: string;
    captchaToken?: string;
}
export interface RegisterStartDto {
    email: string;
    captchaToken?: string;
}
export interface ForgotPasswordDto {
    email: string;
    captchaToken?: string;
}
export interface LoginResponse {
    accessToken: string;
    user: Omit<User, 'passwordHash' | 'emailVerificationOtp'>;
}
export declare enum ListType {
    DAILY = "DAILY",
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY",
    YEARLY = "YEARLY",
    CUSTOM = "CUSTOM",
    DONE = "DONE",
    TRASH = "TRASH"
}
export declare enum TaskBehavior {
    RECURRING = "RECURRING",
    ONE_OFF = "ONE_OFF"
}
export declare enum CompletionPolicy {
    AUTO_DELETE = "AUTO_DELETE",
    KEEP = "KEEP",
    MOVE_TO_DONE = "MOVE_TO_DONE"
}
export interface ToDoList {
    id: string;
    name: string;
    ownerId: string;
    order: number;
    type: ListType;
    taskBehavior: TaskBehavior;
    completionPolicy: CompletionPolicy;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    tasks?: Task[];
}
export interface CreateToDoListDto {
    name: string;
    taskBehavior?: TaskBehavior;
    completionPolicy?: CompletionPolicy;
}
export interface UpdateToDoListDto {
    name?: string;
    taskBehavior?: TaskBehavior;
    completionPolicy?: CompletionPolicy;
}
export interface Task {
    id: string;
    description: string;
    completed: boolean;
    completedAt: string | null;
    todoListId: string;
    originalListId?: string | null;
    order: number;
    dueDate: string | null;
    reminderDaysBefore: number[];
    specificDayOfWeek: number | null;
    reminderConfig?: unknown;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    steps?: Step[];
    todoList?: ToDoList;
}
export interface CreateTaskDto {
    description: string;
    dueDate?: string;
    specificDayOfWeek?: number;
    reminderDaysBefore?: number[];
    reminderConfig?: unknown;
    completed?: boolean;
}
export interface UpdateTaskDto {
    description?: string;
    dueDate?: string | null;
    specificDayOfWeek?: number | null;
    reminderDaysBefore?: number[];
    reminderConfig?: unknown;
    completed?: boolean;
    order?: number;
    todoListId?: string;
}
export interface Step {
    id: string;
    description: string;
    completed: boolean;
    taskId: string;
    order: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}
export interface CreateStepDto {
    description: string;
    completed?: boolean;
}
export interface UpdateStepDto {
    description?: string;
    completed?: boolean;
}
export interface ReorderStepsDto {
    stepIds: string[];
}
export interface ReminderNotification {
    taskId: string;
    taskDescription: string;
    dueDate: string | null;
    reminderDate: string;
    reminderDaysBefore: number;
    message: string;
    title: string;
    listName: string;
    listType: string;
}
export declare enum ShareRole {
    VIEWER = "VIEWER",
    EDITOR = "EDITOR"
}
export interface ShareListDto {
    email: string;
    role?: ShareRole;
    sharedWithId?: string;
}
export interface ShareTaskDto {
    email: string;
    role?: ShareRole;
}
export interface ListShare {
    id: string;
    sharedWithId: string;
    toDoListId: string;
    role: ShareRole;
    sharedWith?: User;
    toDoList?: ToDoList;
}
export interface TaskShare {
    id: string;
    sharedWithId: string;
    taskId: string;
    role: ShareRole;
    sharedWith?: User;
    task?: Task;
}
export interface TrashResponse {
    lists: ToDoList[];
    tasks: Task[];
}
export interface UpdateProfilePictureResponse {
    message: string;
    profilePicture: string;
}
export interface ApiError {
    statusCode: number;
    message: string | string[];
    error?: string;
}
