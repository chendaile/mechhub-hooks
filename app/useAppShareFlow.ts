import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
    useShareGradeResultToClassMutation,
    useSharePrivateChatToClassMutation,
} from "../class/public";
import type { UserProfile } from "../auth/types";
import { APP_ASSIGNMENT_FIXTURES } from "./model/appShellModel";
import type { ShareIntent } from "./types/share";

interface UseAppShareFlowProps {
    classOptionsLength: number;
    currentSessionId: string | null;
    userProfile: UserProfile | null;
}

export const useAppShareFlow = ({
    classOptionsLength,
    currentSessionId,
    userProfile,
}: UseAppShareFlowProps) => {
    const [shareIntent, setShareIntent] = useState<ShareIntent | null>(null);

    const sharePrivateChatToClassMutation =
        useSharePrivateChatToClassMutation();
    const shareGradeResultToClassMutation =
        useShareGradeResultToClassMutation();

    const openSharePicker = useCallback(
        (intent: ShareIntent) => {
            if (classOptionsLength === 0) {
                toast.error("Open Class Hub and join a class first.");
                return;
            }
            setShareIntent(intent);
        },
        [classOptionsLength],
    );

    const handleShareChatMessageToClass = useCallback(
        (messageId: string) => {
            openSharePicker({ kind: "chatMessage", messageId });
        },
        [openSharePicker],
    );

    const handleShareChatSessionToClass = useCallback(
        (sessionId: string) => {
            openSharePicker({ kind: "chatSession", sessionId });
        },
        [openSharePicker],
    );

    const handleShareFeedbackToClass = useCallback(() => {
        openSharePicker({ kind: "gradeFeedback" });
    }, [openSharePicker]);

    const handleConfirmClassShare = useCallback(
        async (classId: string) => {
            if (!shareIntent) {
                return;
            }

            try {
                if (shareIntent.kind === "chatMessage") {
                    if (!currentSessionId) {
                        toast.error(
                            "Open a private chat session before sharing.",
                        );
                        return;
                    }
                    await sharePrivateChatToClassMutation.mutateAsync({
                        classId,
                        chatId: currentSessionId,
                        messageIds: [shareIntent.messageId],
                    });
                } else if (shareIntent.kind === "chatSession") {
                    await sharePrivateChatToClassMutation.mutateAsync({
                        classId,
                        chatId: shareIntent.sessionId,
                    });
                } else {
                    const safeName = userProfile?.name ?? "Unknown Student";

                    await shareGradeResultToClassMutation.mutateAsync({
                        classId,
                        gradePayload: {
                            assignmentTitle:
                                APP_ASSIGNMENT_FIXTURES.assignmentTitle,
                            overallScore:
                                APP_ASSIGNMENT_FIXTURES.viewFeedback
                                    .overallScore,
                            maxScore:
                                APP_ASSIGNMENT_FIXTURES.viewFeedback.maxScore,
                            submittedDate:
                                APP_ASSIGNMENT_FIXTURES.viewFeedback
                                    .submittedDate,
                            teacherName:
                                APP_ASSIGNMENT_FIXTURES.viewFeedback
                                    .teacherName,
                            studentName: safeName,
                            sharedAt: new Date().toISOString(),
                        },
                    });
                }
                setShareIntent(null);
                toast.success("Shared successfully to class.");
            } catch {
                // error handled by mutation or global handler usually, but added empty catch to satisfy lint/flow
            }
        },
        [
            currentSessionId,
            shareIntent,
            shareGradeResultToClassMutation,
            sharePrivateChatToClassMutation,
            userProfile,
        ],
    );

    return {
        shareIntent,
        setShareIntent,
        handleShareChatMessageToClass,
        handleShareChatSessionToClass,
        handleShareFeedbackToClass,
        handleConfirmClassShare,
        isSharing:
            sharePrivateChatToClassMutation.isPending ||
            shareGradeResultToClassMutation.isPending,
    };
};
