import { useState } from "react";
import type { ActiveView } from "../types/view";

export const useActiveViewState = (initialView: ActiveView = "home") => {
    const [activeView, setActiveViewState] = useState<ActiveView>(initialView);

    const setActiveView = (view: ActiveView) => {
        setActiveViewState(view);
    };

    return {
        state: {
            activeView,
        },
        actions: {
            setActiveView,
        },
    };
};
