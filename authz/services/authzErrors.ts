export class AuthorizationServiceError extends Error {
    status?: number;

    constructor(message: string, status?: number) {
        super(message);
        this.name = "AuthorizationServiceError";
        this.status = status;
    }
}

export const extractAuthorizationStatus = (
    error: unknown,
): number | undefined => {
    if (!error || typeof error !== "object") {
        return undefined;
    }

    const errorObject = error as {
        status?: number;
        context?: { status?: number; response?: { status?: number } };
    };

    if (typeof errorObject.status === "number") {
        return errorObject.status;
    }

    if (typeof errorObject.context?.status === "number") {
        return errorObject.context.status;
    }

    if (typeof errorObject.context?.response?.status === "number") {
        return errorObject.context.response.status;
    }

    return undefined;
};

export const toAuthorizationServiceError = (
    error: unknown,
): AuthorizationServiceError => {
    if (error instanceof AuthorizationServiceError) {
        return error;
    }

    if (error instanceof Error) {
        return new AuthorizationServiceError(
            error.message,
            extractAuthorizationStatus(error),
        );
    }

    return new AuthorizationServiceError(String(error));
};

export const isForbiddenError = (error: unknown) => {
    const status = extractAuthorizationStatus(error);
    if (status === 403) {
        return true;
    }

    const message =
        error instanceof Error ? error.message.toLowerCase() : String(error);
    return message.includes("forbidden");
};
