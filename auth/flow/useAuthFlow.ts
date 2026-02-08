import { useAuthActionsFlow } from "./useAuthActionsFlow";
import { useAuthData } from "./useAuthData";
import { useAuthUIState } from "../ui/useAuthUIState";

export const useAuthFlow = () => {
    const authState = useAuthData();
    const authActions = useAuthActionsFlow();
    const authUI = useAuthUIState();

    return {
        ...authState,
        ...authActions,
        ...authUI,
    };
};
