import { useState, useRef } from "react";

export const useImageGradingPanelState = () => {
    const [showDetail, setShowDetail] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
    const stepRefs = useRef<Map<number, HTMLDivElement>>(new Map());
    const stepListContainerRef = useRef<HTMLDivElement | null>(null);

    const openDetail = () => setShowDetail(true);
    const closeDetail = () => setShowDetail(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleSelectStep = (idx: number) => {
        const newIndex = activeStepIndex === idx ? null : idx;
        setActiveStepIndex(newIndex);
        if (newIndex !== null) {
            const stepEl = stepRefs.current.get(newIndex);
            const container = stepListContainerRef.current;
            if (!stepEl || !container) return;

            const containerTop = container.getBoundingClientRect().top;
            const stepTop = stepEl.getBoundingClientRect().top;
            const deltaTop = stepTop - containerTop;
            const targetTop =
                container.scrollTop +
                deltaTop -
                (container.clientHeight - stepEl.clientHeight) / 2;

            container.scrollTo({
                top: Math.max(0, targetTop),
                behavior: "smooth",
            });
        }
    };

    // Zoom and Pan State
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 });

    const handleZoomIn = () => {
        setScale((prev) => Math.min(prev + 0.2, 4));
    };

    const handleZoomOut = () => {
        setScale((prev) => Math.max(prev - 0.2, 0.5));
    };

    const handleReset = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent text selection
        setIsDragging(true);
        dragStartRef.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const newX = e.clientX - dragStartRef.current.x;
        const newY = e.clientY - dragStartRef.current.y;
        setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    return {
        showDetail,
        openDetail,
        closeDetail,
        isSidebarOpen,
        toggleSidebar,
        activeStepIndex,
        handleSelectStep,
        stepRefs,
        stepListContainerRef,
        // Zoom & Pan
        scale,
        position,
        isDragging,
        handleZoomIn,
        handleZoomOut,
        handleReset,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
    };
};
