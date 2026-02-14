import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { useSessionQuery } from "../../auth/queries/useSession";
import type { ClassThread } from "../types";
import { classDomainInterface } from "../interface/ClassDomainInterface";
import { classKeys } from "./classKeys";

export interface ClassThreadsBatchQueryResult {
    dataByClassId: Record<string, ClassThread[]>;
    isFetching: boolean;
    isLoading: boolean;
}

export const useClassThreadsBatchQuery = (
    classIds: string[],
    enabled = true,
): ClassThreadsBatchQueryResult => {
    const { data: session } = useSessionQuery();
    const viewerUserId = session?.user.id ?? null;

    const normalizedClassIds = useMemo(
        () =>
            Array.from(
                new Set(
                    classIds.filter(
                        (classId): classId is string => classId.length > 0,
                    ),
                ),
            ),
        [classIds],
    );

    const threadQueries = useQueries({
        queries: normalizedClassIds.map((classId) => ({
            queryKey: classKeys.threads(viewerUserId, classId),
            queryFn: () => classDomainInterface.listClassThreads(classId),
            enabled: enabled && normalizedClassIds.length > 0 && !!session,
            staleTime: 5_000,
        })),
    });

    const dataByClassId = useMemo(
        () =>
            normalizedClassIds.reduce<Record<string, ClassThread[]>>(
                (accumulator, classId, index) => {
                    accumulator[classId] = threadQueries[index]?.data ?? [];
                    return accumulator;
                },
                {},
            ),
        [normalizedClassIds, threadQueries],
    );

    return {
        dataByClassId,
        isFetching: threadQueries.some((query) => query.isFetching),
        isLoading: threadQueries.some((query) => query.isLoading),
    };
};
