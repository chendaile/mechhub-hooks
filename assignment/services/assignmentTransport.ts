import { supabase } from "../../shared/supabase";
import { toAssignmentServiceError } from "./assignmentErrors";

export const invokeAssignmentCore = async <T>(
    body: Record<string, unknown>,
) => {
    const { data, error } = await supabase.functions.invoke("assignment-core", {
        body,
    });

    if (error) {
        throw toAssignmentServiceError(error);
    }

    return data as T;
};
