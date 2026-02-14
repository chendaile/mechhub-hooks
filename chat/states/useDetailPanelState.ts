import { useState } from "react";

export const useDetailPanelState = () => {
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const openDetail = () => {
        setIsDetailOpen(true);
    };

    const closeDetail = () => {
        setIsDetailOpen(false);
    };

    const toggleSidebar = () => {
        setIsSidebarOpen((previous) => !previous);
    };

    return {
        state: {
            isDetailOpen,
            isSidebarOpen,
        },
        actions: {
            openDetail,
            closeDetail,
            toggleSidebar,
        },
    };
};
