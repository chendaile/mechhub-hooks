export const useLandingPageState = (
    onStart: () => void,
    onLogin: () => void,
) => {
    return {
        handleStart: onStart,
        handleLogin: onLogin,
    };
};
