const SIDEBAR_WIDTH_KEY = "sidebarWidth";

export interface SidebarWidthConfig {
    min: number;
    max: number;
    fallback: number;
}

const toSafeWidth = (value: number, config: SidebarWidthConfig) =>
    Math.min(config.max, Math.max(config.min, value));

export const readSidebarWidth = (config: SidebarWidthConfig): number => {
    if (typeof window === "undefined") {
        return config.fallback;
    }

    const raw = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    const parsed = raw ? parseInt(raw, 10) : config.fallback;
    if (Number.isNaN(parsed)) {
        return config.fallback;
    }

    return toSafeWidth(parsed, config);
};

export const persistSidebarWidth = (
    width: number,
    config: SidebarWidthConfig,
) => {
    if (typeof window === "undefined") {
        return;
    }

    const safeWidth = toSafeWidth(width, config);
    localStorage.setItem(SIDEBAR_WIDTH_KEY, safeWidth.toString());
};
