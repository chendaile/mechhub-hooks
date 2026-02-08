export const useLandingPageState = (
    onStart: () => void,
    onLogin: () => void,
) => {
    // Current Landing Page has very little logic, but for consistency we extract handlers
    // In a real app, this might handle initial animations or tracking

    // Future expansion:
    // const [mounted, setMounted] = useState(false);
    // useEffect(() => setMounted(true), []);

    return {
        handleStart: onStart,
        handleLogin: onLogin,
    };
};
