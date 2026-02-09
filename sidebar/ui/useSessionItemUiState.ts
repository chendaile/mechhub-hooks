import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

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
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(label);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () =>
                document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isMenuOpen]);

    const handleSaveRename = async () => {
        if (!onRename || editTitle.trim() === "" || editTitle === label) {
            setIsEditing(false);
            setEditTitle(label);
            return;
        }

        const success = await onRename(editTitle.trim());
        if (success) {
            setIsEditing(false);
            toast.success("重命名成功");
        } else {
            setEditTitle(label);
            setIsEditing(false);
        }
    };

    const handleCancelRename = () => {
        setIsEditing(false);
        setEditTitle(label);
    };

    const handleStartEdit = () => {
        if (!onRename) return;
        setIsMenuOpen(false);
        setIsEditing(true);
    };

    const handleToggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    const handleDelete = () => {
        setIsMenuOpen(false);
        onDelete?.();
    };

    return {
        isEditing,
        editTitle,
        isMenuOpen,
        inputRef,
        menuRef,
        handleSaveRename,
        handleCancelRename,
        handleStartEdit,
        handleToggleMenu,
        handleDelete,
        setEditTitle,
        canRename: Boolean(onRename),
    };
};
