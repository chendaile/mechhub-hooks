import { useState } from "react";
export const useAuthShowState = () => {
    const [showAuth, setShowAuth] = useState(false);

    return {
        showAuth,
        setShowAuth,
    };
};
