import { toast } from "sonner";
import { useSessionMenuState } from "../states/useSessionMenuState";
import { useSessionRenameState } from "../states/useSessionRenameState";

interface UseSessionItemStateParams {
    label: string;
    onRename?: (newTitle: string) => Promise<boolean>;
    onDelete?: () => void;
}

export const useSessionItemState = ({
    label,
    onRename,
    onDelete,
}: UseSessionItemStateParams) => {
    const menu = useSessionMenuState({ onDelete });
    const rename = useSessionRenameState({
        label,
        onRename,
        onRenameSuccess: () => toast.success("重命名成功"),
    });

    const handleStartEdit = () => {
        menu.actions.closeMenu();
        rename.actions.handleStartEdit();
    };

    return {
        state: {
            isEditing: rename.state.isEditing,
            editTitle: rename.state.editTitle,
            inputRef: rename.state.inputRef,
            canRename: rename.state.canRename,
            isMenuOpen: menu.state.isMenuOpen,
            menuRef: menu.state.menuRef,
        },
        actions: {
            setEditTitle: rename.actions.setEditTitle,
            handleSaveRename: rename.actions.handleSaveRename,
            handleCancelRename: rename.actions.handleCancelRename,
            handleStartEdit,
            handleToggleMenu: menu.actions.handleToggleMenu,
            closeMenu: menu.actions.closeMenu,
            handleDelete: menu.actions.handleDelete,
        },
    };
};
