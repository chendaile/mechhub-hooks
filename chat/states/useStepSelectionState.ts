import { useRef, useState } from "react";

export const useStepSelectionState = () => {
    const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
    const stepRefs = useRef<Map<number, HTMLDivElement>>(new Map());
    const stepListContainerRef = useRef<HTMLDivElement | null>(null);

    const handleSelectStep = (stepIndex: number) => {
        const nextStepIndex = activeStepIndex === stepIndex ? null : stepIndex;
        setActiveStepIndex(nextStepIndex);

        if (nextStepIndex === null) {
            return;
        }

        const selectedStepElement = stepRefs.current.get(nextStepIndex);
        const stepListContainerElement = stepListContainerRef.current;
        if (!selectedStepElement || !stepListContainerElement) {
            return;
        }

        const containerTop =
            stepListContainerElement.getBoundingClientRect().top;
        const stepTop = selectedStepElement.getBoundingClientRect().top;
        const deltaTop = stepTop - containerTop;
        const targetTop =
            stepListContainerElement.scrollTop +
            deltaTop -
            (stepListContainerElement.clientHeight -
                selectedStepElement.clientHeight) /
                2;

        stepListContainerElement.scrollTo({
            top: Math.max(0, targetTop),
            behavior: "smooth",
        });
    };

    return {
        state: {
            activeStepIndex,
            stepRefs,
            stepListContainerRef,
        },
        actions: {
            handleSelectStep,
        },
    };
};
