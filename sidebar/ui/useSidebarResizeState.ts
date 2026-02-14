import { useState, useEffect } from "react";
import {
    persistSidebarWidth,
    readSidebarWidth,
} from "../utils/sidebarWidthStorage";

const MIN_SIDEBAR_WIDTH = 240;
const MAX_SIDEBAR_WIDTH = 500;
const DEFAULT_SIDEBAR_WIDTH = 280;
const SIDEBAR_WIDTH_CONFIG = {
    min: MIN_SIDEBAR_WIDTH,
    max: MAX_SIDEBAR_WIDTH,
    fallback: DEFAULT_SIDEBAR_WIDTH,
} as const;

export const useSidebarResizeState = () => {
    const [sidebarWidth, setSidebarWidth] = useState(() =>
        readSidebarWidth(SIDEBAR_WIDTH_CONFIG),
    );
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
                persistSidebarWidth(newWidth, SIDEBAR_WIDTH_CONFIG);
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

    const state = {
        sidebarWidth,
    };

    const actions = {
        handleMouseDown,
    };

    return {
        state,
        actions,
        sidebarWidth: state.sidebarWidth,
        handleMouseDown: actions.handleMouseDown,
    };
};
