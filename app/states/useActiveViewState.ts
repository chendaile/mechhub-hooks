import { useState } from "react";
import type { ActiveView } from "../types/view";

export const useActiveViewState = (initialView: ActiveView = "home") => {
    const [activeView, setActiveView] = useState<ActiveView>(initialView);

    return {
        state: {
            activeView,
        },
        actions: {
            setActiveView,
        },
    };
};
