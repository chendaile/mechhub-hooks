import { useQuery } from "@tanstack/react-query";
import { useSessionQuery } from "../../auth/queries/useSession";
import { classDomainInterface } from "../interface/ClassDomainInterface";
import { classKeys } from "./classKeys";

export const useMyClassContextQuery = () => {
    const { data: session } = useSessionQuery();

    return useQuery({
        queryKey: classKeys.context(),
        queryFn: classDomainInterface.getMyClassContext,
        enabled: !!session,
        staleTime: 60_000,
    });
};

export const useClassMembersQuery = (classId?: string, enabled = true) =>
    useQuery({
        queryKey: classKeys.members(classId ?? "unknown"),
        queryFn: () => classDomainInterface.listClassMembers(classId ?? ""),
        enabled: enabled && !!classId,
        staleTime: 30_000,
    });

export const useInviteCodesQuery = (classId?: string, enabled = true) =>
    useQuery({
        queryKey: classKeys.inviteCodes(classId ?? "unknown"),
        queryFn: () => classDomainInterface.listInviteCodes(classId ?? ""),
        enabled: enabled && !!classId,
        staleTime: 15_000,
    });

export const useClassThreadsQuery = (classId?: string, enabled = true) =>
    useQuery({
        queryKey: classKeys.threads(classId ?? "unknown"),
        queryFn: () => classDomainInterface.listClassThreads(classId ?? ""),
        enabled: enabled && !!classId,
        staleTime: 5_000,
    });

export const useClassThreadMessagesQuery = (
    threadId?: string,
    enabled = true,
) =>
    useQuery({
        queryKey: classKeys.threadMessages(threadId ?? "unknown"),
        queryFn: () =>
            classDomainInterface.getClassThreadMessages(threadId ?? ""),
        enabled: enabled && !!threadId,
        staleTime: 2_000,
    });
