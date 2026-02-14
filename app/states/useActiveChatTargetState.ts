import { useState } from "react";
import type { ActiveChatTarget } from "../model/appShellModel";

interface SetClassChatTargetPayload {
    classId: string;
    className: string;
    threadId: string;
    threadTitle: string;
    currentUserId: string;
}

export const useActiveChatTargetState = () => {
    const [activeChatTarget, setActiveChatTarget] = useState<ActiveChatTarget>({
        type: "private",
    });

    const setPrivateChatTarget = () => {
        setActiveChatTarget({ type: "private" });
    };

    const setClassChatTarget = ({
        classId,
        className,
        threadId,
        threadTitle,
        currentUserId,
    }: SetClassChatTargetPayload) => {
        setActiveChatTarget({
            type: "class",
            classId,
            className,
            threadId,
            threadTitle,
            currentUserId,
        });
    };

    const classChatTarget =
        activeChatTarget.type === "class" ? activeChatTarget : undefined;
    const activeClassThreadId =
        activeChatTarget.type === "class"
            ? activeChatTarget.threadId
            : undefined;

    return {
        state: {
            activeChatTarget,
            classChatTarget,
            activeClassThreadId,
        },
        actions: {
            setActiveChatTarget,
            setPrivateChatTarget,
            setClassChatTarget,
        },
        activeChatTarget,
        classChatTarget,
        activeClassThreadId,
        setActiveChatTarget,
        setPrivateChatTarget,
        setClassChatTarget,
    };
};
