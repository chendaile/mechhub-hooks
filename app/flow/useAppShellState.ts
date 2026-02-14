import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthFlow } from "../../auth/public";
import { hasPermission, useMyAuthorizationQuery } from "../../authz/public";
import {
    chatUseCases,
    useChatRuntimeFlow,
    useChatSessionsFlow,
} from "../../chat/public";
import {
    useClassThreadsBatchQuery,
    useCreateGroupThreadMutation,
    useMyClassContextQuery,
} from "../../class/public";
import { useActiveChatTargetState } from "../states/useActiveChatTargetState";
import { useSelectedClassState } from "../states/useSelectedClassState";
import { useAppShareFlow } from "../useAppShareFlow";
import { useAppView } from "../useAppView";
import type { ActiveView } from "../types/view";
import {
    APP_ASSIGNMENT_FIXTURES,
    APP_CLASS_MEMBERSHIP_NOTICES,
    APP_FALLBACK_USER_PROFILE,
    buildSharePickerDescription,
    createClassOptions,
    isSidebarThread,
    type AppShellEnterClassChatPayload,
    type AppShellViewAccess,
} from "../model/appShellModel";
import { canAccessView, resolveFallbackView } from "../utils/viewAccess";

export const useAppShellState = () => {
    const [creatingClassThreadId, setCreatingClassThreadId] = useState<
        string | null
    >(null);

    const {
        session,
        loading,
        showAuth,
        setShowAuth,
        userProfile,
        handleUpdateProfile,
        handleSignOut,
    } = useAuthFlow();

    const safeUserProfile = userProfile ?? APP_FALLBACK_USER_PROFILE;

    const {
        data: authorization,
        isLoading: isAuthorizationLoading,
        isFetching: isAuthorizationFetching,
    } = useMyAuthorizationQuery();
    const { data: classContext, isLoading: isClassContextLoading } =
        useMyClassContextQuery();

    const canAccessChat = hasPermission(authorization, "chat.access");
    const canAccessProfile = hasPermission(authorization, "profile.access");
    const canAccessStudentAssignments = hasPermission(
        authorization,
        "assignment.student.access",
    );
    const canAccessTeacherAssignments = hasPermission(
        authorization,
        "assignment.teacher.access",
    );
    const canAccessClassHub =
        !!classContext?.isAdmin ||
        canAccessStudentAssignments ||
        canAccessTeacherAssignments;

    const viewAccess = useMemo<AppShellViewAccess>(
        () => ({
            canAccessChat,
            canAccessProfile,
            canAccessClassHub,
            canAccessStudentAssignments,
            canAccessTeacherAssignments,
        }),
        [
            canAccessChat,
            canAccessProfile,
            canAccessClassHub,
            canAccessStudentAssignments,
            canAccessTeacherAssignments,
        ],
    );

    const teachingClasses = classContext?.teachingClasses ?? [];
    const joinedClasses = classContext?.joinedClasses ?? [];
    const classOptions = useMemo(
        () => createClassOptions(teachingClasses, joinedClasses),
        [teachingClasses, joinedClasses],
    );

    const selectedClassState = useSelectedClassState(classOptions);
    const selectedClassId = selectedClassState.state.selectedClassId;
    const selectedClass = useMemo(
        () =>
            classOptions.find((classItem) => classItem.id === selectedClassId),
        [classOptions, selectedClassId],
    );
    const hasStudentClassMembership = joinedClasses.length > 0;
    const hasTeacherClassMembership = teachingClasses.length > 0;

    const classThreadsBatchQuery = useClassThreadsBatchQuery(
        classOptions.map((classItem) => classItem.id),
        !!session && canAccessClassHub,
    );

    const classSessionGroups = useMemo(
        () =>
            classOptions.map((classItem) => {
                const threadRows =
                    classThreadsBatchQuery.dataByClassId[classItem.id] ?? [];
                const threads = threadRows
                    .filter(isSidebarThread)
                    .map((thread) => ({
                        id: thread.id,
                        classId: classItem.id,
                        title: thread.title,
                        threadType: thread.threadType as
                            | "group"
                            | "shared_chat",
                    }));

                return {
                    classId: classItem.id,
                    className: classItem.name,
                    role: classItem.role,
                    threads,
                };
            }),
        [classOptions, classThreadsBatchQuery.dataByClassId],
    );

    const {
        chatSessions,
        isLoadingSessions,
        currentSessionId,
        chatMode,
        setChatMode,
        deleteChatSession,
        handleSelectSession,
        handleStartNewQuest,
        handleClearCurrentSessionSelection,
        handleRenameSession,
        messages,
        setCurrentSessionId,
    } = useChatSessionsFlow(session, canAccessChat);

    const { isTyping, handleSendMessage, handleStopGeneration } =
        useChatRuntimeFlow({
            currentSessionId,
            setCurrentSessionId,
        });

    const guardedSendMessage = canAccessChat
        ? handleSendMessage
        : () => undefined;
    const { activeView, setActiveView, onSendMessage, onStartChat } =
        useAppView({
            handleSendMessage: guardedSendMessage,
        });

    const fallbackView = useMemo(
        () => resolveFallbackView(viewAccess),
        [viewAccess],
    );

    useEffect(() => {
        if (!session) {
            return;
        }

        if (!canAccessView(activeView, viewAccess)) {
            setActiveView(fallbackView);
        }
    }, [activeView, fallbackView, session, setActiveView, viewAccess]);

    const guardedSetActiveView = useCallback(
        (view: ActiveView) => {
            setActiveView(
                canAccessView(view, viewAccess) ? view : fallbackView,
            );
        },
        [fallbackView, setActiveView, viewAccess],
    );

    const activeChatTargetState = useActiveChatTargetState();

    const safeChatSessions = canAccessChat ? chatSessions : [];
    const safeCurrentSessionId = canAccessChat ? currentSessionId : null;
    const safeMessages = canAccessChat ? messages : [];
    const safeIsLoadingSessions = canAccessChat ? isLoadingSessions : false;
    const safeIsTyping = canAccessChat ? isTyping : false;
    const safeSetChatMode = canAccessChat ? setChatMode : () => undefined;
    const safeOnSendMessage = canAccessChat
        ? (payload: Parameters<typeof onSendMessage>[0]) => {
              activeChatTargetState.actions.setPrivateChatTarget();
              onSendMessage(payload);
          }
        : () => undefined;
    const safeOnStartChat = canAccessChat
        ? (
              message?: string,
              imageUrls?: string[],
              fileAttachments?: Parameters<typeof onStartChat>[2],
              model?: string,
              mode?: Parameters<typeof onStartChat>[4],
          ) => {
              activeChatTargetState.actions.setPrivateChatTarget();
              onStartChat(message, imageUrls, fileAttachments, model, mode);
          }
        : () => undefined;
    const safeHandleStopGeneration = canAccessChat
        ? handleStopGeneration
        : () => undefined;
    const safeDeleteChatSession = canAccessChat
        ? deleteChatSession
        : async () => ({ success: false, wasCurrentSession: false });
    const safeHandleSelectSession = canAccessChat
        ? (id: string) => {
              activeChatTargetState.actions.setPrivateChatTarget();
              return handleSelectSession(id);
          }
        : () => false;
    const safeHandleStartNewQuest = canAccessChat
        ? () => {
              activeChatTargetState.actions.setPrivateChatTarget();
              handleStartNewQuest();
          }
        : () => undefined;
    const safeHandleRenameSession = canAccessChat
        ? handleRenameSession
        : async () => false;

    const {
        shareIntent,
        setShareIntent,
        handleShareChatMessageToClass,
        handleShareChatSessionToClass,
        handleShareFeedbackToClass,
        handleConfirmClassShare,
        isSharing,
    } = useAppShareFlow({
        classOptionsLength: classOptions.length,
        currentSessionId: safeCurrentSessionId,
        userProfile: safeUserProfile,
    });

    const createGroupThreadMutation = useCreateGroupThreadMutation();

    const getClassNameById = useCallback(
        (classId: string) =>
            classOptions.find((classItem) => classItem.id === classId)?.name ??
            classId,
        [classOptions],
    );

    const handleEnterClassChat = useCallback(
        (payload: AppShellEnterClassChatPayload) => {
            const className =
                payload.className ?? getClassNameById(payload.classId);

            handleClearCurrentSessionSelection();
            selectedClassState.actions.setSelectedClassId(payload.classId);
            activeChatTargetState.actions.setClassChatTarget({
                classId: payload.classId,
                className,
                threadId: payload.threadId,
                threadTitle: payload.threadTitle,
                currentUserId: session?.user.id ?? "",
            });
            guardedSetActiveView("chat");
        },
        [
            activeChatTargetState.actions,
            getClassNameById,
            guardedSetActiveView,
            handleClearCurrentSessionSelection,
            selectedClassState.actions,
            session?.user.id,
        ],
    );

    const handleSelectClassThread = useCallback(
        (thread: { classId: string; id: string; title: string }) => {
            handleEnterClassChat({
                classId: thread.classId,
                threadId: thread.id,
                threadTitle: thread.title,
            });
        },
        [handleEnterClassChat],
    );

    const handleCreateClassThread = useCallback(
        async (classId: string) => {
            try {
                setCreatingClassThreadId(classId);
                const thread = await createGroupThreadMutation.mutateAsync({
                    classId,
                    title: "班级讨论",
                });

                handleEnterClassChat({
                    classId,
                    threadId: thread.id,
                    threadTitle: thread.title,
                });
            } catch {
            } finally {
                setCreatingClassThreadId(null);
            }
        },
        [createGroupThreadMutation, handleEnterClassChat],
    );

    const classChatTarget = activeChatTargetState.state.classChatTarget;
    const activeClassThreadId = activeChatTargetState.state.activeClassThreadId;
    const chatTargetType = activeChatTargetState.state.activeChatTarget.type;

    const sharePickerDescription = buildSharePickerDescription(shareIntent);

    const isAppLoading =
        loading ||
        (session &&
            (isAuthorizationLoading ||
                isAuthorizationFetching ||
                isClassContextLoading));

    return {
        state: {
            session,
            showAuth,
            activeView,
            selectedClassId,
            activeChatTarget: activeChatTargetState.state.activeChatTarget,
            shareIntent,
            chatMode,
        },
        actions: {
            setShowAuth,
            setActiveView: guardedSetActiveView,
            setSelectedClassId: selectedClassState.actions.setSelectedClassId,
            setShareIntent,
            handleUpdateProfile,
            handleSignOut,
            onSendMessage: safeOnSendMessage,
            onStartChat: safeOnStartChat,
            setChatMode: safeSetChatMode,
            handleStopGeneration: safeHandleStopGeneration,
            deleteChatSession: safeDeleteChatSession,
            handleSelectSession: safeHandleSelectSession,
            handleStartNewQuest: safeHandleStartNewQuest,
            handleRenameSession: safeHandleRenameSession,
            handleSelectClassThread,
            handleCreateClassThread,
            handleEnterClassChat,
            handleShareChatMessageToClass,
            handleShareChatSessionToClass,
            handleShareFeedbackToClass,
            handleConfirmClassShare,
        },
        derived: {
            safeUserProfile,
            permissions: viewAccess,
            fallbackView,
            classOptions,
            selectedClass,
            classSessionGroups,
            hasStudentClassMembership,
            hasTeacherClassMembership,
            chatSessions: safeChatSessions,
            currentSessionId: safeCurrentSessionId,
            messages: safeMessages,
            isLoadingSessions: safeIsLoadingSessions,
            isTyping: safeIsTyping,
            uploadImage: chatUseCases.storagePort.uploadImage,
            chatTargetType,
            classChatTarget,
            activeClassThreadId,
            sharePickerDescription,
            classHubProps: {
                requesterEmail: session?.user.email,
                canCreateClass:
                    !!classContext?.isAdmin || canAccessTeacherAssignments,
                canJoinClass:
                    canAccessStudentAssignments || canAccessTeacherAssignments,
                selectedClassId,
                onSelectedClassIdChange:
                    selectedClassState.actions.setSelectedClassId,
                onEnterClassChat: handleEnterClassChat,
            },
            assignmentFixtures: APP_ASSIGNMENT_FIXTURES,
            classMembershipNotices: APP_CLASS_MEMBERSHIP_NOTICES,
        },
        meta: {
            isAppLoading,
            loading,
            isAuthorizationLoading,
            isAuthorizationFetching,
            isClassContextLoading,
            isSharing,
            creatingClassThreadId,
        },
    };
};
