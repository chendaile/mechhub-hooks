export { useAppShellState } from "./flow/useAppShellState";
export { useAppView } from "./useAppView";
export { useAppShareFlow } from "./useAppShareFlow";
export type { ActiveView } from "./types/view";
export type { ShareIntent } from "./types/share";
export type {
    ActiveChatTarget,
    AppShellClassGroup,
    AppShellClassThread,
    AppShellEnterClassChatPayload,
    AppShellViewAccess,
} from "./model/appShellModel";
export {
    buildAssignmentClassNameMap,
    buildSubmitAssignmentViewModel,
    buildViewFeedbackGroups,
} from "./model/appAssignmentViewModel";
export {
    resolveAssignmentPanelNode,
    shouldShowLandingPage,
    type AssignmentNoticeConfig,
    type AssignmentNoticeCopy,
} from "./model/appShellRenderModel";
