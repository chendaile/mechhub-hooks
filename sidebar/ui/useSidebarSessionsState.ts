import { useEffect, useState } from "react";
import type { SidebarClassGroup } from "@views/sidebar/types";

export const useSidebarSessionsState = (classGroups: SidebarClassGroup[]) => {
    const [openGroupIds, setOpenGroupIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (classGroups.length === 0) {
            setOpenGroupIds(new Set());
            return;
        }

        setOpenGroupIds((previous) => {
            const next = new Set<string>();

            classGroups.forEach((group) => {
                if (previous.has(group.classId)) {
                    next.add(group.classId);
                }
            });

            if (next.size === 0) {
                next.add(classGroups[0].classId);
            }

            return next;
        });
    }, [classGroups]);

    const handleToggleGroup = (classId: string) => {
        setOpenGroupIds((previous) => {
            const next = new Set(previous);

            if (next.has(classId)) {
                next.delete(classId);
                return next;
            }

            next.add(classId);
            return next;
        });
    };

    return {
        openGroupIds,
        handleToggleGroup,
    };
};
