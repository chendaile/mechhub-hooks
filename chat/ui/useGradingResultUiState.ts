import { useState } from "react";
import type { ImageGradingResult } from "../types/message";

export const useGradingResultUiState = (images: ImageGradingResult[]) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [thinkingOpen, setThinkingOpen] = useState(true);

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

    const handleToggleAnalysis = () => {
        setShowAnalysis((prev) => {
            const next = !prev;
            if (next) {
                setThinkingOpen(true);
            }
            return next;
        });
    };

    const handleToggleThinking = () => {
        setThinkingOpen((prev) => !prev);
    };

    return {
        currentImageIndex,
        showAnalysis,
        thinkingOpen,
        handlePrevImage,
        handleNextImage,
        handleToggleAnalysis,
        handleToggleThinking,
    };
};
