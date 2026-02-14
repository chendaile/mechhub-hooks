import { useEffect, useRef, useState } from "react";

interface UseSessionMenuStateParams {
    onDelete?: () => void;
}

export const useSessionMenuState = ({
    onDelete,
}: UseSessionMenuStateParams = {}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () =>
                document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isMenuOpen]);

    const handleToggleMenu = () => {
        setIsMenuOpen((previous) => !previous);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const handleDelete = () => {
        setIsMenuOpen(false);
        onDelete?.();
    };

    return {
        state: {
            isMenuOpen,
            menuRef,
        },
        actions: {
            handleToggleMenu,
            closeMenu,
            handleDelete,
        },
    };
};
