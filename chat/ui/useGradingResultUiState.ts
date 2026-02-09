import { useState } from "react";
import type { ImageGradingResult } from "../types/message";

export const useGradingResultUiState = (images: ImageGradingResult[]) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [thinkingOpen, setThinkingOpen] = useState(false);
    const [bodyOpen, setBodyOpen] = useState(false);

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => {
            if (images.length === 0) return prev;
            return prev > 0 ? prev - 1 : images.length - 1;
        });
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => {
            if (images.length === 0) return prev;
            return prev < images.length - 1 ? prev + 1 : 0;
        });
    };

    const handleToggleThinking = () => {
        setThinkingOpen((prev) => !prev);
    };

    const handleToggleBody = () => {
        setBodyOpen((prev) => !prev);
    };

    return {
        currentImageIndex,
        thinkingOpen,
        bodyOpen,
        handlePrevImage,
        handleNextImage,
        handleToggleThinking,
        handleToggleBody,
    };
};
