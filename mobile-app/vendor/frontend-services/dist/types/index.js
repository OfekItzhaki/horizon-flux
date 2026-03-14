// User Types
export var NotificationFrequency;
(function (NotificationFrequency) {
    NotificationFrequency["NONE"] = "NONE";
    NotificationFrequency["DAILY"] = "DAILY";
    NotificationFrequency["WEEKLY"] = "WEEKLY";
})(NotificationFrequency || (NotificationFrequency = {}));
// List Types
export var ListType;
(function (ListType) {
    ListType["DAILY"] = "DAILY";
    ListType["WEEKLY"] = "WEEKLY";
    ListType["MONTHLY"] = "MONTHLY";
    ListType["YEARLY"] = "YEARLY";
    ListType["CUSTOM"] = "CUSTOM";
    ListType["DONE"] = "DONE";
    ListType["TRASH"] = "TRASH";
})(ListType || (ListType = {}));
export var TaskBehavior;
(function (TaskBehavior) {
    TaskBehavior["RECURRING"] = "RECURRING";
    TaskBehavior["ONE_OFF"] = "ONE_OFF";
})(TaskBehavior || (TaskBehavior = {}));
export var CompletionPolicy;
(function (CompletionPolicy) {
    CompletionPolicy["AUTO_DELETE"] = "AUTO_DELETE";
    CompletionPolicy["KEEP"] = "KEEP";
    CompletionPolicy["MOVE_TO_DONE"] = "MOVE_TO_DONE";
})(CompletionPolicy || (CompletionPolicy = {}));
// List Sharing Types
export var ShareRole;
(function (ShareRole) {
    ShareRole["VIEWER"] = "VIEWER";
    ShareRole["EDITOR"] = "EDITOR";
})(ShareRole || (ShareRole = {}));
