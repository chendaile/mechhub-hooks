import { useMemo } from "react";
import { createDefaultChatWiring } from "./createDefaultChatWiring";
import type { ChatWiring } from "./chatWiring";

export const useDefaultChatWiring = (): ChatWiring =>
    useMemo(() => createDefaultChatWiring(), []);
