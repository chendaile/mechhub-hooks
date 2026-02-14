export const createLandingPageHandlers = (
    onStart: () => void,
    onLogin: () => void,
) => {
    return {
        handleStart: onStart,
        handleLogin: onLogin,
    };
};
