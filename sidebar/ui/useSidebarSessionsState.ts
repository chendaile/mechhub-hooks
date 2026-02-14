import { useEffect, useMemo, useState } from "react";
import type { SidebarClassGroup } from "../model/sidebarSessionModel";

const areSetsEqual = (left: Set<string>, right: Set<string>) => {
    if (left.size !== right.size) {
        return false;
    }

    for (const value of left) {
        if (!right.has(value)) {
            return false;
        }
    }

    return true;
};

export const useSidebarSessionsState = (classGroups: SidebarClassGroup[]) => {
    const [openGroupIds, setOpenGroupIds] = useState<Set<string>>(new Set());
    const classGroupIdsSignature = useMemo(
        () => classGroups.map((group) => group.classId).join("\u0000"),
        [classGroups],
    );

    useEffect(() => {
        if (!classGroupIdsSignature) {
            setOpenGroupIds((previous) =>
                previous.size === 0 ? previous : new Set(),
            );
            return;
        }

        const validIds = new Set(classGroupIdsSignature.split("\u0000"));

        setOpenGroupIds((previous) => {
            const next = new Set<string>();

            for (const classId of previous) {
                if (validIds.has(classId)) {
                    next.add(classId);
                }
            }

            if (areSetsEqual(previous, next)) {
                return previous;
            }

            return next;
        });
    }, [classGroupIdsSignature]);

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

    const state = {
        openGroupIds,
    };

    const actions = {
        handleToggleGroup,
    };

    return {
        state,
        actions,
        openGroupIds: state.openGroupIds,
        handleToggleGroup: actions.handleToggleGroup,
    };
};
