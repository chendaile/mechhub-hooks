import { supabase } from "../../shared/supabase";
import { toClassServiceError } from "./classErrors";

export const invokeClassManagement = async <T>(
    body: Record<string, unknown>,
) => {
    const { data, error } = await supabase.functions.invoke(
        "class-management",
        {
            body,
        },
    );

    if (error) {
        throw toClassServiceError(error);
    }

    return data as T;
};

export const invokeClassChat = async <T>(body: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke("class-chat", {
        body,
    });

    if (error) {
        throw toClassServiceError(error);
    }

    return data as T;
};
