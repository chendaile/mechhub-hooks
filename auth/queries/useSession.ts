import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../shared/supabase";
import { authKeys } from "./authKeys";
import { authUseCases } from "../infra/authDeps";

export const useSession = () => {
    const queryClient = useQueryClient();

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            queryClient.setQueryData(authKeys.session(), session);
        });

        return () => subscription.unsubscribe();
    }, [queryClient]);

    return useQuery({
        queryKey: authKeys.session(),
        queryFn: authUseCases.getSession,
        staleTime: Infinity,
    });
};
