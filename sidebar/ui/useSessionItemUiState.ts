import { useSessionItemState } from "./useSessionItemState";

interface UseSessionItemUiStateParams {
    label: string;
    onRename?: (newTitle: string) => Promise<boolean>;
    onDelete?: () => void;
}

export const useSessionItemUiState = ({
    label,
    onRename,
    onDelete,
}: UseSessionItemUiStateParams) => {
    const { state, actions } = useSessionItemState({
        label,
        onRename,
        onDelete,
    });

    return {
        isEditing: state.isEditing,
        editTitle: state.editTitle,
        isMenuOpen: state.isMenuOpen,
        inputRef: state.inputRef,
        menuRef: state.menuRef,
        handleSaveRename: actions.handleSaveRename,
        handleCancelRename: actions.handleCancelRename,
        handleStartEdit: actions.handleStartEdit,
        handleToggleMenu: actions.handleToggleMenu,
        handleDelete: actions.handleDelete,
        closeMenu: actions.closeMenu,
        setEditTitle: actions.setEditTitle,
        canRename: state.canRename,
    };
};
