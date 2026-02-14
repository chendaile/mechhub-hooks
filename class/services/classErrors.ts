export class ClassServiceError extends Error {
    status?: number;

    constructor(message: string, status?: number) {
        super(message);
        this.name = "ClassServiceError";
        this.status = status;
    }
}

export const extractClassErrorStatus = (error: unknown): number | undefined => {
    if (!error || typeof error !== "object") {
        return undefined;
    }

    const obj = error as {
        status?: number;
        context?: { status?: number; response?: { status?: number } };
    };

    if (typeof obj.status === "number") {
        return obj.status;
    }

    if (typeof obj.context?.status === "number") {
        return obj.context.status;
    }

    if (typeof obj.context?.response?.status === "number") {
        return obj.context.response.status;
    }

    return undefined;
};

export const toClassServiceError = (error: unknown): ClassServiceError => {
    if (error instanceof ClassServiceError) {
        return error;
    }

    if (error instanceof Error) {
        return new ClassServiceError(
            error.message,
            extractClassErrorStatus(error),
        );
    }

    return new ClassServiceError(String(error));
};

export const isClassForbiddenError = (error: unknown) => {
    const status = extractClassErrorStatus(error);
    if (status === 403) {
        return true;
    }

    const message =
        error instanceof Error ? error.message.toLowerCase() : String(error);
    return message.includes("forbidden");
};
