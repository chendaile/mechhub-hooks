import { toast } from "sonner";
import type { ActiveView } from "../../app/types/view";

interface SidebarHandlers {
    handleSelectSession?: (id: string) => boolean;
    handleStartNewQuest?: () => void;
    deleteChatSession?: (id: string) => Promise<{
        success: boolean;
        wasCurrentSession: boolean;
    }>;
}

interface UseSidebarActionsParams extends SidebarHandlers {
    setActiveView: (view: ActiveView) => void;
}

export const useSidebarActionsFlow = ({
    setActiveView,
    handleSelectSession,
    handleStartNewQuest,
    deleteChatSession,
}: UseSidebarActionsParams) => {
    const onNewQuest = () => {
        handleStartNewQuest?.();
        setActiveView("home");
    };

    const onSelectSession = (id: string) => {
        if (handleSelectSession?.(id)) {
            setActiveView("chat");
        }
    };

    const handleDeleteSession = async (id: string) => {
        if (!deleteChatSession) return;

        const result = await deleteChatSession(id);
        if (result.success) {
            toast.success("对话已删除");
            if (result.wasCurrentSession) {
                setActiveView("home");
            }
            return;
        }

        toast.error("删除失败");
    };

    return {
        onNewQuest,
        onSelectSession,
        handleDeleteSession,
    };
};
