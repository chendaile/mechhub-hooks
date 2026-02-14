import { useAuthProfileFlow } from "./useAuthProfileFlow";
import { useAuthSessionFlow } from "./useAuthSessionFlow";

export const useAuthFlow = () => {
    const sessionFlow = useAuthSessionFlow();
    const profileFlow = useAuthProfileFlow();

    const state = {
        session: sessionFlow.state.session,
        loading: sessionFlow.state.loading,
        showAuth: sessionFlow.state.showAuth,
        userProfile: profileFlow.state.userProfile,
        isUpdating: profileFlow.state.isUpdating,
    };

    const actions = {
        setShowAuth: sessionFlow.actions.setShowAuth,
        handleUpdateProfile: profileFlow.actions.handleUpdateProfile,
        handleSignOut: profileFlow.actions.handleSignOut,
    };

    return {
        state,
        actions,
        session: state.session,
        loading: state.loading,
        userProfile: state.userProfile,
        showAuth: state.showAuth,
        setShowAuth: actions.setShowAuth,
        handleUpdateProfile: actions.handleUpdateProfile,
        handleSignOut: actions.handleSignOut,
        isUpdating: state.isUpdating,
    };
};
