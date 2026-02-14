import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authKeys } from "./authKeys";
import { authDomainInterface } from "../interface/AuthDomainInterface";

export const useSessionQuery = () => {
    const queryClient = useQueryClient();

    useEffect(() => {
        const unsubscribe = authDomainInterface.onAuthStateChange((session) => {
            queryClient.setQueryData(authKeys.session(), session);
        });

        return () => unsubscribe();
    }, [queryClient]);

    return useQuery({
        queryKey: authKeys.session(),
        queryFn: authDomainInterface.getSession,
        staleTime: Infinity,
    });
};
