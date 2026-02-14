import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthFlow } from "../../auth/public";
import { hasPermission, useMyAuthorizationQuery } from "../../authz/public";
import {
    chatUseCases,
    type Message as ChatMessage,
    useChatRuntimeFlow,
    useChatSessionsFlow,
} from "../../chat/public";
import {
    useClassThreadsBatchQuery,
    useCreateGroupThreadMutation,
    useDeleteClassThreadMutation,
    useMyClassContextQuery,
    useRenameClassThreadMutation,
} from "../../class/public";
import { chatKeys } from "../../chat/queries/chatKeys";
import { upsertSavedChatSession } from "../../chat/queries/chatCache";
import { authzKeys } from "../../authz/queries/authzKeys";
import { classKeys } from "../../class/queries/classKeys";
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

const DEFAULT_IMPORTED_MODEL = "qwen3-vl-235b-a22b-thinking";

const normalizeSharedChatMessage = (value: unknown): ChatMessage | null => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return null;
    }

    const record = value as Record<string, unknown>;
    const role = record.role === "assistant" ? "assistant" : "user";
    const text =
        typeof record.text === "string"
            ? record.text
            : typeof record.content === "string"
              ? record.content
              : "";

    const imageUrls = Array.isArray(record.imageUrls)
        ? record.imageUrls.filter(
              (item): item is string => typeof item === "string",
          )
        : undefined;

    const fileAttachments = Array.isArray(record.fileAttachments)
        ? record.fileAttachments
              .map((item) => {
                  if (
                      !item ||
                      typeof item !== "object" ||
                      Array.isArray(item)
                  ) {
                      return null;
                  }
                  const attachment = item as Record<string, unknown>;
                  const filename =
                      typeof attachment.filename === "string"
                          ? attachment.filename
                          : "";
                  const content =
                      typeof attachment.content === "string"
                          ? attachment.content
                          : "";
                  const language =
                      typeof attachment.language === "string"
                          ? attachment.language
                          : undefined;

                  if (!filename || !content) {
                      return null;
                  }

                  return {
                      filename,
                      content,
                      ...(language ? { language } : {}),
                  };
              })
              .filter((item) => !!item)
        : undefined;

    const mode = record.mode === "correct" ? "correct" : "study";
    const model =
        typeof record.model === "string" && record.model.trim()
            ? record.model
            : DEFAULT_IMPORTED_MODEL;
    const type = record.type === "grading" ? "grading" : "text";

    return {
        id:
            typeof record.id === "string" && record.id
                ? record.id
                : crypto.randomUUID(),
        role,
        type,
        text,
        mode,
        model,
        ...(imageUrls && imageUrls.length > 0 ? { imageUrls } : {}),
        ...(fileAttachments && fileAttachments.length > 0
            ? { fileAttachments }
            : {}),
        ...(typeof record.reasoning === "string"
            ? { reasoning: record.reasoning }
            : {}),
        ...(typeof record.createdAt === "string"
            ? { createdAt: record.createdAt }
            : {}),
        ...(record.gradingResult &&
        typeof record.gradingResult === "object" &&
        !Array.isArray(record.gradingResult)
            ? {
                  gradingResult: record.gradingResult as NonNullable<
                      ChatMessage["gradingResult"]
                  >,
              }
            : {}),
    };
};

const parseSharedChatMessages = (content: Record<string, unknown>) =>
    Array.isArray(content.sharedMessages)
        ? content.sharedMessages
              .map(normalizeSharedChatMessage)
              .filter((message): message is ChatMessage => !!message)
        : [];

export const useAppShellState = () => {
    const queryClient = useQueryClient();
    const [creatingClassThreadId, setCreatingClassThreadId] = useState<
        string | null
    >(null);
    const previousViewerUserIdRef = useRef<string | null | undefined>(
        undefined,
    );

    const {
        session,
        loading,
        showAuth,
        setShowAuth,
        userProfile,
        handleUpdateProfile,
        handleSignOut,
    } = useAuthFlow();
    const viewerUserId = session?.user.id ?? null;

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
        handleConfirmThreadShare,
        isSharing,
    } = useAppShareFlow({
        classThreadGroups: classSessionGroups,
        currentSessionId: safeCurrentSessionId,
    });

    useEffect(() => {
        const previousViewerUserId = previousViewerUserIdRef.current;
        if (previousViewerUserId === undefined) {
            previousViewerUserIdRef.current = viewerUserId;
            return;
        }

        if (previousViewerUserId === viewerUserId) {
            return;
        }

        handleStopGeneration();
        setShareIntent(null);
        handleClearCurrentSessionSelection();
        activeChatTargetState.actions.setPrivateChatTarget();
        selectedClassState.actions.setSelectedClassId(null);
        setChatMode("study");
        guardedSetActiveView("home");

        if (previousViewerUserId !== null) {
            void (async () => {
                await Promise.all([
                    queryClient.cancelQueries({
                        queryKey: chatKeys.all(previousViewerUserId),
                    }),
                    queryClient.cancelQueries({
                        queryKey: classKeys.all(previousViewerUserId),
                    }),
                    queryClient.cancelQueries({
                        queryKey: authzKeys.all(previousViewerUserId),
                    }),
                ]);

                queryClient.removeQueries({
                    queryKey: chatKeys.all(previousViewerUserId),
                });
                queryClient.removeQueries({
                    queryKey: classKeys.all(previousViewerUserId),
                });
                queryClient.removeQueries({
                    queryKey: authzKeys.all(previousViewerUserId),
                });
            })();
        }

        previousViewerUserIdRef.current = viewerUserId;
    }, [
        activeChatTargetState.actions,
        guardedSetActiveView,
        handleClearCurrentSessionSelection,
        handleStopGeneration,
        queryClient,
        selectedClassState.actions,
        setChatMode,
        setShareIntent,
        viewerUserId,
    ]);

    const createGroupThreadMutation = useCreateGroupThreadMutation();
    const renameClassThreadMutation = useRenameClassThreadMutation();
    const deleteClassThreadMutation = useDeleteClassThreadMutation();

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

    const handleRenameClassThread = useCallback(
        async (classId: string, threadId: string, title: string) => {
            const nextTitle = title.trim();
            if (!nextTitle) {
                toast.error("请输入有效的话题名称");
                return false;
            }

            if (nextTitle.length > 60) {
                toast.error("话题名称最多 60 个字符");
                return false;
            }

            try {
                const thread = await renameClassThreadMutation.mutateAsync({
                    classId,
                    threadId,
                    title: nextTitle,
                });

                const currentClassTarget =
                    activeChatTargetState.state.classChatTarget;
                if (currentClassTarget?.threadId === threadId) {
                    activeChatTargetState.actions.setClassChatTarget({
                        ...currentClassTarget,
                        threadTitle: thread.title,
                    });
                }

                return true;
            } catch {
                return false;
            }
        },
        [
            activeChatTargetState.actions,
            activeChatTargetState.state.classChatTarget,
            renameClassThreadMutation,
        ],
    );

    const handleDeleteClassThread = useCallback(
        async (classId: string, threadId: string) => {
            try {
                const result = await deleteClassThreadMutation.mutateAsync({
                    classId,
                    threadId,
                });

                const currentClassTarget =
                    activeChatTargetState.state.classChatTarget;
                if (currentClassTarget?.threadId === threadId) {
                    activeChatTargetState.actions.setPrivateChatTarget();
                    selectedClassState.actions.setSelectedClassId(classId);
                    guardedSetActiveView("classHub");
                }

                return result.success;
            } catch {
                return false;
            }
        },
        [
            activeChatTargetState.actions,
            activeChatTargetState.state.classChatTarget,
            deleteClassThreadMutation,
            guardedSetActiveView,
            selectedClassState.actions,
        ],
    );

    const handleCopySharedClassMessageToNewSession = useCallback(
        async (content: Record<string, unknown>) => {
            if (!canAccessChat) {
                toast.error("Chat access is required.");
                return;
            }

            const sharedMessages = parseSharedChatMessages(content);
            if (sharedMessages.length === 0) {
                toast.error("分享内容为空，无法复制到会话。");
                return;
            }

            const sourceTitle =
                typeof content.sourceTitle === "string" && content.sourceTitle
                    ? content.sourceTitle
                    : "班级分享";
            const sessionTitle = `复制分享: ${sourceTitle}`.slice(0, 40);

            try {
                const savedSession = await chatUseCases.chatQueryUseCases.saveChat(
                    null,
                    sharedMessages,
                    sessionTitle,
                );

                upsertSavedChatSession(queryClient, viewerUserId, savedSession);
                await queryClient.invalidateQueries({
                    queryKey: chatKeys.lists(viewerUserId),
                    refetchType: "inactive",
                });

                setCurrentSessionId(savedSession.id);
                activeChatTargetState.actions.setPrivateChatTarget();
                guardedSetActiveView("chat");
                toast.success("已复制到你的新会话");
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : "复制失败";
                toast.error(message);
            }
        },
        [
            activeChatTargetState.actions,
            canAccessChat,
            guardedSetActiveView,
            queryClient,
            setCurrentSessionId,
            viewerUserId,
        ],
    );

    const classChatTarget = activeChatTargetState.state.classChatTarget;
    const activeClassThreadId = activeChatTargetState.state.activeClassThreadId;
    const chatTargetType = activeChatTargetState.state.activeChatTarget.type;

    const shareableThreadGroups = useMemo(
        () =>
            classSessionGroups.map((group) => ({
                ...group,
                threads: group.threads.filter(
                    (thread) => thread.threadType === "group",
                ),
            })),
        [classSessionGroups],
    );

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
            handleRenameClassThread,
            handleDeleteClassThread,
            handleEnterClassChat,
            handleShareChatMessageToClass,
            handleShareChatSessionToClass,
            handleConfirmThreadShare,
            handleCopySharedClassMessageToNewSession,
        },
        derived: {
            safeUserProfile,
            permissions: viewAccess,
            isClassAdmin: !!classContext?.isAdmin,
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
            shareableThreadGroups,
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
                onRenameClassThread: handleRenameClassThread,
                onDeleteClassThread: handleDeleteClassThread,
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
