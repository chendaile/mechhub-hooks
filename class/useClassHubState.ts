import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
    useJoinClassByInviteCodeMutation,
    useClassMembersQuery,
    useClassThreadsQuery,
    useCreateClassMutation,
    useCreateGroupThreadMutation,
    useInviteCodesQuery,
    useMyClassContextQuery,
} from "./queries/useClassQueries";

type HubScreen = "collection" | "dashboard";
type HubThreadType = "group" | "shared_chat";

const isHubThreadType = (
    threadType: "group" | "shared_chat" | "shared_grade",
): threadType is HubThreadType =>
    threadType === "group" || threadType === "shared_chat";

interface UseClassHubStateProps {
    requesterEmail?: string;
    selectedClassId: string | null;
    onSelectedClassIdChange: (classId: string | null) => void;
    onEnterClassChat?: (payload: {
        classId: string;
        className: string;
        threadId: string;
        threadTitle: string;
    }) => void;
    onRenameClassThread?: (
        classId: string,
        threadId: string,
        title: string,
    ) => Promise<boolean>;
    onDeleteClassThread?: (
        classId: string,
        threadId: string,
    ) => Promise<boolean>;
    onDeleteClass?: (classId: string) => Promise<boolean>;
    onLeaveClass?: (classId: string) => Promise<boolean>;
}

export const useClassHubState = ({
    selectedClassId,
    onSelectedClassIdChange,
    onEnterClassChat,
    onRenameClassThread,
    onDeleteClassThread,
    onDeleteClass,
    onLeaveClass,
}: UseClassHubStateProps) => {
    const [screen, setScreen] = useState<HubScreen>("collection");

    const [createClassName, setCreateClassName] = useState("");
    const [createClassDescription, setCreateClassDescription] = useState("");

    const [inviteCodeInput, setInviteCodeInput] = useState("");
    const [threadTitleInput, setThreadTitleInput] = useState("");
    const [inviteCodeForDisplay, setInviteCodeForDisplay] = useState<{
        classId: string;
        code: string;
    } | null>(null);

    const classContextQuery = useMyClassContextQuery();

    const classOptions = useMemo(() => {
        const teaching = classContextQuery.data?.teachingClasses ?? [];
        const joined = classContextQuery.data?.joinedClasses ?? [];
        const map = new Map<
            string,
            (typeof teaching)[number] | (typeof joined)[number]
        >();

        teaching.forEach((item) => map.set(item.id, item));
        joined.forEach((item) => {
            if (!map.has(item.id)) {
                map.set(item.id, item);
            }
        });

        return Array.from(map.values());
    }, [classContextQuery.data]);

    useEffect(() => {
        if (screen !== "dashboard") {
            return;
        }

        const selectedExists =
            !!selectedClassId &&
            classOptions.some((item) => item.id === selectedClassId);
        if (!selectedExists) {
            setScreen("collection");
        }
    }, [classOptions, screen, selectedClassId]);

    const selectedClass = classOptions.find(
        (item) => item.id === selectedClassId,
    );
    const canCreateThread =
        !!selectedClassId &&
        (!!classContextQuery.data?.isAdmin ||
            selectedClass?.role === "teacher");
    const canDeleteClass =
        !!selectedClass &&
        (!!classContextQuery.data?.isAdmin ||
            selectedClass?.role === "teacher");
    const canLeaveClass = !!selectedClass;
    const canManageThreads = canCreateThread;
    const isDashboardEnabled = screen === "dashboard" && !!selectedClassId;

    const classMembersQuery = useClassMembersQuery(
        selectedClassId ?? undefined,
        isDashboardEnabled,
        {
            staleTime: 5_000,
            refetchInterval: 10_000,
            refetchOnMount: "always",
        },
    );
    const classThreadsQuery = useClassThreadsQuery(
        selectedClassId ?? undefined,
        isDashboardEnabled,
    );
    const canViewInviteCodes = isDashboardEnabled;
    const inviteCodesQuery = useInviteCodesQuery(
        selectedClassId ?? undefined,
        canViewInviteCodes,
    );
    const isLoadingMembers = classMembersQuery.isLoading;

    const teachers = classMembersQuery.data?.teachers ?? [];
    const students = classMembersQuery.data?.students ?? [];
    const threads = (classThreadsQuery.data ?? []).filter((thread) =>
        isHubThreadType(thread.threadType),
    );
    const inviteCodeValue = useMemo(() => {
        if (!canViewInviteCodes) {
            return null;
        }

        const createdCode =
            inviteCodeForDisplay?.classId === selectedClassId
                ? inviteCodeForDisplay.code
                : null;
        if (createdCode) {
            return createdCode;
        }

        if (inviteCodesQuery.isLoading) {
            return null;
        }

        const latestActiveCode = (inviteCodesQuery.data ?? [])
            .filter((code) => !code.isRevoked)
            .sort((left, right) => {
                const leftTime = left.createdAt
                    ? new Date(left.createdAt).getTime()
                    : 0;
                const rightTime = right.createdAt
                    ? new Date(right.createdAt).getTime()
                    : 0;
                return rightTime - leftTime;
            })[0];

        return latestActiveCode ? latestActiveCode.code : null;
    }, [
        canViewInviteCodes,
        inviteCodeForDisplay,
        inviteCodesQuery.data,
        inviteCodesQuery.isLoading,
        selectedClassId,
    ]);

    const inviteCodeDisplayText = useMemo(() => {
        if (!canViewInviteCodes) {
            return undefined;
        }

        if (inviteCodesQuery.isLoading && !inviteCodeValue) {
            return "加载中...";
        }

        return inviteCodeValue || "暂无";
    }, [canViewInviteCodes, inviteCodesQuery.isLoading, inviteCodeValue]);

    const createClassMutation = useCreateClassMutation();
    const joinClassMutation = useJoinClassByInviteCodeMutation();
    const createGroupThreadMutation = useCreateGroupThreadMutation();

    useEffect(() => {
        setThreadTitleInput("");
    }, [selectedClassId]);

    const openThreadChat = (threadId: string, threadTitle?: string) => {
        if (!selectedClass) {
            return;
        }
        const thread = threads.find((item) => item.id === threadId);
        const resolvedTitle = threadTitle ?? thread?.title;
        if (!resolvedTitle) {
            return;
        }

        onEnterClassChat?.({
            classId: selectedClass.id,
            className: selectedClass.name,
            threadId,
            threadTitle: resolvedTitle,
        });
    };

    const handleCreateClass = async () => {
        if (!createClassName.trim()) {
            toast.error("请输入班级名称");
            return;
        }

        try {
            const createdClass = await createClassMutation.mutateAsync({
                name: createClassName.trim(),
                description: createClassDescription.trim(),
            });
            if (createdClass.inviteCode) {
                setInviteCodeForDisplay({
                    classId: createdClass.classSummary.id,
                    code: createdClass.inviteCode,
                });
            }
            onSelectedClassIdChange(createdClass.classSummary.id);
            setCreateClassName("");
            setCreateClassDescription("");
            setScreen("dashboard");
        } catch {}
    };

    const handleJoinByInviteCode = async () => {
        if (!inviteCodeInput.trim()) {
            toast.error("请输入邀请码");
            return;
        }

        try {
            const result = await joinClassMutation.mutateAsync({
                inviteCode: inviteCodeInput.trim(),
            });
            onSelectedClassIdChange(result.classSummary.id);
            setInviteCodeInput("");
            setScreen("dashboard");
        } catch {}
    };

    const handleCreateThread = async () => {
        if (!selectedClassId || !canCreateThread) {
            toast.error("只有教师或管理员可以创建话题。");
            return;
        }

        const normalizedTitle = threadTitleInput.trim();
        if (!normalizedTitle) {
            toast.error("请输入话题名称");
            return;
        }

        if (normalizedTitle.length > 60) {
            toast.error("话题名称最多 60 个字符。");
            return;
        }

        try {
            const newThread = await createGroupThreadMutation.mutateAsync({
                classId: selectedClassId,
                title: normalizedTitle,
            });
            setThreadTitleInput("");
            openThreadChat(newThread.id, newThread.title);
        } catch {}
    };

    const handleRenameThread = async (threadId: string) => {
        if (!selectedClassId || !canManageThreads || !onRenameClassThread) {
            return;
        }

        const thread = threads.find((item) => item.id === threadId);
        if (!thread || thread.threadType !== "group") {
            toast.error("仅群聊话题支持重命名。");
            return;
        }

        const nextTitle = window.prompt("请输入新的话题名称", thread.title);
        if (nextTitle === null) {
            return;
        }

        const normalizedTitle = nextTitle.trim();
        if (!normalizedTitle) {
            toast.error("请输入有效的话题名称。");
            return;
        }

        if (normalizedTitle.length > 60) {
            toast.error("话题名称最多 60 个字符。");
            return;
        }

        if (normalizedTitle === thread.title) {
            return;
        }

        await onRenameClassThread(selectedClassId, threadId, normalizedTitle);
    };

    const handleDeleteThread = async (threadId: string) => {
        if (!selectedClassId || !canManageThreads || !onDeleteClassThread) {
            return;
        }

        const thread = threads.find((item) => item.id === threadId);
        if (!thread || thread.threadType !== "group") {
            toast.error("仅群聊话题支持删除。");
            return;
        }

        const confirmed = window.confirm(
            `确认删除话题「${thread.title}」吗？该操作不可恢复。`,
        );
        if (!confirmed) {
            return;
        }

        await onDeleteClassThread(selectedClassId, threadId);
    };

    const handleCopyInviteCode = async () => {
        if (!inviteCodeValue) {
            toast.error("暂无可复制的邀请码");
            return;
        }

        try {
            await navigator.clipboard.writeText(inviteCodeValue);
            toast.success("邀请码已复制");
        } catch {
            toast.error("复制失败");
        }
    };

    const handleDeleteClass = async () => {
        if (!selectedClass || !canDeleteClass) {
            toast.error("只有老师或管理员可以删除班级。");
            return;
        }

        if (!onDeleteClass) {
            toast.error("删除班级功能不可用。");
            return;
        }

        const confirmed = window.confirm(
            `确认删除班级「${selectedClass.name}」吗？该操作不可恢复。`,
        );
        if (!confirmed) {
            return;
        }

        const success = await onDeleteClass(selectedClass.id);
        if (success) {
            onSelectedClassIdChange(null);
            setScreen("collection");
        }
    };

    const handleLeaveClass = async () => {
        if (!selectedClass || !canLeaveClass) {
            toast.error("无法退出当前班级。");
            return;
        }

        if (!onLeaveClass) {
            toast.error("退出班级功能不可用。");
            return;
        }

        const confirmed = window.confirm(
            `确认退出班级「${selectedClass.name}」吗？退出后需要重新加入。`,
        );
        if (!confirmed) {
            return;
        }

        const success = await onLeaveClass(selectedClass.id);
        if (success) {
            onSelectedClassIdChange(null);
            setScreen("collection");
        }
    };

    return {
        screen,
        setScreen,
        isAdmin: !!classContextQuery.data?.isAdmin,
        classOptions,
        createClassName,
        setCreateClassName,
        createClassDescription,
        setCreateClassDescription,
        handleCreateClass,
        isCreatingClass: createClassMutation.isPending,
        inviteCodeInput,
        setInviteCodeInput,
        handleJoinByInviteCode,
        isJoiningClass: joinClassMutation.isPending,
        teachers,
        students,
        threads,
        handleCreateThread,
        threadTitleInput,
        setThreadTitleInput,
        canCreateThread,
        canManageThreads,
        canDeleteClass,
        canLeaveClass,
        handleRenameThread,
        handleDeleteThread,
        handleDeleteClass,
        handleLeaveClass,
        isCreatingThread: createGroupThreadMutation.isPending,
        isLoadingMembers,
        openThreadChat,
        inviteCodeDisplayText,
        inviteCodeValue,
        handleCopyInviteCode,
    };
};
