import { useEffect, useRef, useState } from "react";

interface UseSessionRenameStateParams {
    label: string;
    onRename?: (newTitle: string) => Promise<boolean>;
    onRenameSuccess?: () => void;
}

export const useSessionRenameState = ({
    label,
    onRename,
    onRenameSuccess,
}: UseSessionRenameStateParams) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(label);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleSaveRename = async () => {
        if (!onRename || editTitle.trim() === "" || editTitle === label) {
            setIsEditing(false);
            setEditTitle(label);
            return;
        }

        const success = await onRename(editTitle.trim());
        if (success) {
            setIsEditing(false);
            onRenameSuccess?.();
            return;
        }

        setEditTitle(label);
        setIsEditing(false);
    };

    const handleCancelRename = () => {
        setIsEditing(false);
        setEditTitle(label);
    };

    const handleStartEdit = () => {
        if (!onRename) return;
        setIsEditing(true);
    };

    return {
        state: {
            isEditing,
            editTitle,
            inputRef,
            canRename: Boolean(onRename),
        },
        actions: {
            setEditTitle,
            handleSaveRename,
            handleCancelRename,
            handleStartEdit,
        },
    };
};
