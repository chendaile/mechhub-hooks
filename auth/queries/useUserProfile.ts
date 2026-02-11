import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authKeys } from "./authKeys";
import { authUseCases } from "../interface/authUseCases";
import type { AuthSession } from "../types";

export const useUserProfile = (session: AuthSession | null) => {
    const queryClient = useQueryClient();

    useEffect(() => {
        queryClient.setQueryData(
            authKeys.profile(),
            authUseCases.parseUserProfile(session),
        );
    }, [queryClient, session]);

    return useQuery({
        queryKey: authKeys.profile(),
        queryFn: () => authUseCases.parseUserProfile(session),
        initialData: authUseCases.parseUserProfile(session),
        staleTime: Infinity,
    });
};
