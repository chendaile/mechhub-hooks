export interface Logger {
    error: (message: string, payload?: unknown) => void;
    warn: (message: string, payload?: unknown) => void;
    info: (message: string, payload?: unknown) => void;
    debug: (message: string, payload?: unknown) => void;
}

const browserLogger: Logger = {
    error: (message, payload) => {
        if (payload !== undefined) {
            console.error(message, payload);
            return;
        }

        console.error(message);
    },
    warn: (message, payload) => {
        if (payload !== undefined) {
            console.warn(message, payload);
            return;
        }

        console.warn(message);
    },
    info: (message, payload) => {
        if (payload !== undefined) {
            console.info(message, payload);
            return;
        }

        console.info(message);
    },
    debug: (message, payload) => {
        if (payload !== undefined) {
            console.debug(message, payload);
            return;
        }

        console.debug(message);
    },
};

let activeLogger: Logger = browserLogger;

export const setHooksLogger = (nextLogger: Logger) => {
    activeLogger = nextLogger;
};

export const getHooksLogger = (): Logger => activeLogger;
