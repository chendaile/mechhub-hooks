import { useQuery } from "@tanstack/react-query";
import { useSessionQuery } from "../../auth/queries/useSession";
import { classDomainInterface } from "../interface/ClassDomainInterface";
import { classKeys } from "./classKeys";

export const useMyClassContextQuery = () => {
    const { data: session } = useSessionQuery();
    const viewerUserId = session?.user.id ?? null;

    return useQuery({
        queryKey: classKeys.context(viewerUserId),
        queryFn: classDomainInterface.getMyClassContext,
        enabled: !!session,
        staleTime: 60_000,
    });
};

export const useClassMembersQuery = (classId?: string, enabled = true) => {
    const { data: session } = useSessionQuery();
    const viewerUserId = session?.user.id ?? null;

    return useQuery({
        queryKey: classKeys.members(viewerUserId, classId ?? "unknown"),
        queryFn: () => classDomainInterface.listClassMembers(classId ?? ""),
        enabled: enabled && !!classId && !!session,
        staleTime: 30_000,
    });
};

export const useInviteCodesQuery = (classId?: string, enabled = true) => {
    const { data: session } = useSessionQuery();
    const viewerUserId = session?.user.id ?? null;

    return useQuery({
        queryKey: classKeys.inviteCodes(viewerUserId, classId ?? "unknown"),
        queryFn: () => classDomainInterface.listInviteCodes(classId ?? ""),
        enabled: enabled && !!classId && !!session,
        staleTime: 15_000,
    });
};

export const useClassThreadsQuery = (classId?: string, enabled = true) => {
    const { data: session } = useSessionQuery();
    const viewerUserId = session?.user.id ?? null;

    return useQuery({
        queryKey: classKeys.threads(viewerUserId, classId ?? "unknown"),
        queryFn: () => classDomainInterface.listClassThreads(classId ?? ""),
        enabled: enabled && !!classId && !!session,
        staleTime: 5_000,
    });
};

export const useClassThreadMessagesQuery = (
    threadId?: string,
    enabled = true,
) => {
    const { data: session } = useSessionQuery();
    const viewerUserId = session?.user.id ?? null;

    return useQuery({
        queryKey: classKeys.threadMessages(viewerUserId, threadId ?? "unknown"),
        queryFn: () =>
            classDomainInterface.getClassThreadMessages(threadId ?? ""),
        enabled: enabled && !!threadId && !!session,
        staleTime: 2_000,
    });
};
