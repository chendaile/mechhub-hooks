import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authKeys } from "./authKeys";
import { authDomainInterface } from "../interface/AuthDomainInterface";
import type { AuthSession } from "../types";

export const useUserProfileQuery = (session: AuthSession | null) => {
    const queryClient = useQueryClient();

    useEffect(() => {
        queryClient.setQueryData(
            authKeys.profile(),
            authDomainInterface.parseUserProfile(session),
        );
    }, [queryClient, session]);

    return useQuery({
        queryKey: authKeys.profile(),
        queryFn: () => authDomainInterface.parseUserProfile(session),
        initialData: authDomainInterface.parseUserProfile(session),
        staleTime: Infinity,
    });
};
