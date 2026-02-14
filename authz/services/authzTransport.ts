import { supabase } from "../../shared/supabase";
import { toAuthorizationServiceError } from "./authzErrors";

export const invokePermissionsAdmin = async <T>(
    body: Record<string, unknown>,
) => {
    const { data, error } = await supabase.functions.invoke(
        "permissions-admin",
        {
            body,
        },
    );

    if (error) {
        throw toAuthorizationServiceError(error);
    }

    return data as T;
};
