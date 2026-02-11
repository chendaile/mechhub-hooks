import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authKeys } from "./authKeys";
import { authUseCases } from "../interface/authUseCases";

export const useSession = () => {
    const queryClient = useQueryClient();

    useEffect(() => {
        const unsubscribe = authUseCases.onAuthStateChange((session) => {
            queryClient.setQueryData(authKeys.session(), session);
        });

        return () => unsubscribe();
    }, [queryClient]);

    return useQuery({
        queryKey: authKeys.session(),
        queryFn: authUseCases.getSession,
        staleTime: Infinity,
    });
};
