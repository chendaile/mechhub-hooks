import { useState } from "react";

export const usePublishAssignmentFormState = () => {
    const [assignmentName, setAssignmentName] = useState("");
    const [selectedModule, setSelectedModule] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [dueTime, setDueTime] = useState("");
    const [instructions, setInstructions] = useState("");
    const [aiGradingEnabled, setAiGradingEnabled] = useState(true);

    return {
        state: {
            assignmentName,
            selectedModule,
            dueDate,
            dueTime,
            instructions,
            aiGradingEnabled,
        },
        actions: {
            setAssignmentName,
            setSelectedModule,
            setDueDate,
            setDueTime,
            setInstructions,
            setAiGradingEnabled,
        },
    };
};
