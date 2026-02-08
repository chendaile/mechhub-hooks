import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { authKeys } from "./authKeys";
import { DEFAULT_USER } from "../constants";
import { authUseCases } from "../infra/authDeps";

export const useUserProfile = (session: Session | null) => {
    const queryClient = useQueryClient();

    useEffect(() => {
        queryClient.setQueryData(
            authKeys.profile(),
            authUseCases.parseUserProfile(session, DEFAULT_USER),
        );
    }, [queryClient, session]);

    return useQuery({
        queryKey: authKeys.profile(),
        queryFn: () => authUseCases.parseUserProfile(session, DEFAULT_USER),
        initialData: authUseCases.parseUserProfile(session, DEFAULT_USER),
        staleTime: Infinity,
    });
};
