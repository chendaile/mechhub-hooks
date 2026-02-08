import { useState } from "react";

export const useAuthUIState = () => {
    const [showAuth, setShowAuth] = useState(false);

    return {
        showAuth,
        setShowAuth,
    };
};
