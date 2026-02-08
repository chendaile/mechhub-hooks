import { useState, useEffect } from "react";

const MIN_SIDEBAR_WIDTH = 240;
const MAX_SIDEBAR_WIDTH = 500;
const DEFAULT_SIDEBAR_WIDTH = 280;

export const useSidebarResizeState = () => {
    const [sidebarWidth, setSidebarWidth] = useState(() => {
        if (typeof window === "undefined") return DEFAULT_SIDEBAR_WIDTH;
        const saved = localStorage.getItem("sidebarWidth");
        const parsed = saved ? parseInt(saved, 10) : DEFAULT_SIDEBAR_WIDTH;
        return isNaN(parsed) ? DEFAULT_SIDEBAR_WIDTH : parsed;
    });
    const [isResizing, setIsResizing] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;

            const newWidth = e.clientX;
            if (
                newWidth >= MIN_SIDEBAR_WIDTH &&
                newWidth <= MAX_SIDEBAR_WIDTH
            ) {
                setSidebarWidth(newWidth);
                localStorage.setItem("sidebarWidth", newWidth.toString());
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
            document.body.style.cursor = "ew-resize";
            document.body.style.userSelect = "none";
        }

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };
    }, [isResizing]);

    const handleMouseDown = () => {
        setIsResizing(true);
    };

    return {
        sidebarWidth,
        handleMouseDown,
    };
};
