export class AssignmentServiceError extends Error {
    status?: number;

    constructor(message: string, status?: number) {
        super(message);
        this.name = "AssignmentServiceError";
        this.status = status;
    }
}

export const extractAssignmentErrorStatus = (
    error: unknown,
): number | undefined => {
    if (!error || typeof error !== "object") {
        return undefined;
    }

    const record = error as {
        status?: number;
        context?: { status?: number; response?: { status?: number } };
    };

    if (typeof record.status === "number") {
        return record.status;
    }

    if (typeof record.context?.status === "number") {
        return record.context.status;
    }

    if (typeof record.context?.response?.status === "number") {
        return record.context.response.status;
    }

    return undefined;
};

export const toAssignmentServiceError = (
    error: unknown,
): AssignmentServiceError => {
    if (error instanceof AssignmentServiceError) {
        return error;
    }

    if (error instanceof Error) {
        return new AssignmentServiceError(
            error.message,
            extractAssignmentErrorStatus(error),
        );
    }

    return new AssignmentServiceError(String(error));
};
