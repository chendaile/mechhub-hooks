import { useEffect, useState } from "react";
import type { AppShellClassOption } from "../model/appShellModel";

export const useSelectedClassState = (classOptions: AppShellClassOption[]) => {
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

    useEffect(() => {
        if (classOptions.length === 0) {
            setSelectedClassId(null);
            return;
        }

        const selectedExists =
            !!selectedClassId &&
            classOptions.some((classItem) => classItem.id === selectedClassId);
        if (!selectedExists) {
            setSelectedClassId(classOptions[0].id);
        }
    }, [classOptions, selectedClassId]);

    return {
        state: {
            selectedClassId,
        },
        actions: {
            setSelectedClassId,
        },
        selectedClassId,
        setSelectedClassId,
    };
};
