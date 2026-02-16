import { useState } from "react";

export const usePublishAssignmentFormState = () => {
    const [title, setTitle] = useState("");
    const [classId, setClassId] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [dueTime, setDueTime] = useState("");
    const [instructions, setInstructions] = useState("");
    const [aiGradingEnabled, setAiGradingEnabled] = useState(true);

    return {
        state: {
            title,
            classId,
            dueDate,
            dueTime,
            instructions,
            aiGradingEnabled,
        },
        actions: {
            setTitle,
            setClassId,
            setDueDate,
            setDueTime,
            setInstructions,
            setAiGradingEnabled,
        },
    };
};
