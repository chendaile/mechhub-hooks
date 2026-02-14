import { useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

interface Position {
    x: number;
    y: number;
}

const INITIAL_POSITION: Position = {
    x: 0,
    y: 0,
};

export const useImagePanZoomState = () => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState<Position>(INITIAL_POSITION);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef<Position>(INITIAL_POSITION);

    const handleZoomIn = () => {
        setScale((previous) => Math.min(previous + 0.2, 4));
    };

    const handleZoomOut = () => {
        setScale((previous) => Math.max(previous - 0.2, 0.5));
    };

    const handleReset = () => {
        setScale(1);
        setPosition(INITIAL_POSITION);
    };

    const handleMouseDown = (event: ReactMouseEvent) => {
        event.preventDefault();
        setIsDragging(true);
        dragStartRef.current = {
            x: event.clientX - position.x,
            y: event.clientY - position.y,
        };
    };

    const handleMouseMove = (event: ReactMouseEvent) => {
        if (!isDragging) {
            return;
        }

        const nextPosition = {
            x: event.clientX - dragStartRef.current.x,
            y: event.clientY - dragStartRef.current.y,
        };

        setPosition(nextPosition);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    return {
        state: {
            scale,
            position,
            isDragging,
        },
        actions: {
            handleZoomIn,
            handleZoomOut,
            handleReset,
            handleMouseDown,
            handleMouseMove,
            handleMouseUp,
        },
    };
};
