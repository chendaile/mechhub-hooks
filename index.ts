export { useAuthFlow } from "./auth/flow/useAuthFlow";
export { useAuthPageState } from "./auth/ui/useAuthPageState";
export { useLandingPageState } from "./landing/ui/useLandingPageState";
export { useProfileState } from "./auth/ui/useProfileState";
export { useSidebarActionsFlow } from "./sidebar/flow/useSidebarActionsFlow";
export { useSidebarResizeState } from "./sidebar/ui/useSidebarResizeState";
export { useSessionItemUiState } from "./sidebar/ui/useSessionItemUiState";
export { useSidebarSessionsState } from "./sidebar/ui/useSidebarSessionsState";
export {
    useSidebarFooterState,
    type SidebarFooterAction,
    type SidebarFooterActionViewKey,
    type SidebarFooterActionAudience,
} from "./sidebar/ui/useSidebarFooterState";
export { useAppView } from "./app/useAppView";
export type { ActiveView } from "./app/types/view";
export { useSubmitAssignmentState } from "./assignment/ui/useSubmitAssignmentState";
export { usePublishAssignmentState } from "./assignment/ui/usePublishAssignmentState";
export { useGradeAssignmentState } from "./assignment/ui/useGradeAssignmentState";
export { useViewFeedbackState } from "./assignment/ui/useViewFeedbackState";
export type {
    AssignmentStudentSubmission,
    AssignmentGradeBreakdown,
    AssignmentKeyInsight,
} from "./assignment/types";
export { PERMISSION_LABELS } from "./authz/constants";
export {
    hasPermission,
    isForbiddenError,
    useAdminUserAccess,
    useAdminUserSearch,
    useMyAuthorization,
    usePermissionGate,
    useUpsertUserAccess,
} from "./authz/queries/useAuthorizationQueries";
export type {
    PermissionKey,
    BaseRole,
    PermissionEffect,
    AuthorizationSnapshot,
    UpsertUserAccessPayload,
    AdminUserSummary,
} from "./authz/types";
export { PERMISSION_KEYS } from "./authz/types";

export {
    isClassForbiddenError,
    useMyClassContext,
    useClassMembers,
    useInviteCodes,
    useClassThreads,
    useClassThreadMessages,
    useCreateClass,
    useAssignTeacherToClass,
    useCreateInviteCode,
    useRevokeInviteCode,
    useJoinClassByInviteCode,
    useRemoveStudentFromClass,
    useCreateGroupThread,
    usePostClassMessage,
    useSharePrivateChatToClass,
    useShareGradeResultToClass,
} from "./class/queries/useClassQueries";
export type {
    ClassRole,
    ClassSummary,
    MyClassContext,
    InviteCodeSummary,
    ClassMemberSummary,
    ClassMembersSnapshot,
    CreateClassPayload,
    CreateInviteCodePayload,
    JoinClassByCodePayload,
    AssignTeacherPayload,
    RemoveStudentPayload,
    ClassThreadType,
    ClassThread,
    ClassThreadMessageRole,
    ClassThreadMessage,
    PostClassMessagePayload,
    PostClassMessageResult,
    SharePrivateChatPayload,
    ShareGradeResultPayload,
} from "./class/types";

export { chatUseCases } from "./chat/interface/chatUseCases";
export { useChatRuntimeFlow } from "./chat/flow/useChatRuntimeFlow";
export { useChatSessionsFlow } from "./chat/flow/useChatSessionsFlow";
export { useMessageListUiState } from "./chat/ui/useMessageListUiState";
export {
    useAttachmentUploadState,
    type UploadImageHandler,
    type UploadImageResult,
} from "./chat/ui/useAttachmentUploadState";
export { useChatModelState } from "./chat/ui/useChatModelState";
export { useSendState } from "./chat/ui/useSendState";
export { useTextCopyState } from "./chat/ui/useTextCopyState";
export { useTextMessageUiState } from "./chat/ui/useTextMessageUiState";
export { useImageGradingPanelState } from "./chat/ui/useImageGradingPanelState";
export { useGradingResultUiState } from "./chat/ui/useGradingResultUiState";
export type {
    ChatMode,
    Message,
    SubmitMessage,
    FileAttachment,
    DeleteChatResult,
    GradingResult,
    GradingStep,
    ImageGradingResult,
    ChatSession,
} from "./chat/types";
export type { ChatQueryUseCases } from "./chat/interface/ChatQueryUseCases";

export type { UserProfile } from "./auth/types";
export type { AuthMode } from "./auth/types";
