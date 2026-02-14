const SUPPORTED_TEXT_FILE_EXTENSIONS = [
    ".txt",
    ".py",
    ".js",
    ".java",
    ".cpp",
    ".c",
    ".go",
    ".rs",
    ".rb",
    ".php",
    ".ts",
    ".tsx",
    ".jsx",
    ".sql",
    ".html",
    ".css",
    ".json",
    ".yaml",
    ".yml",
    ".xml",
    ".md",
    ".markdown",
    ".sh",
    ".bash",
] as const;

const LANGUAGE_MAP: Record<string, string> = {
    ".py": "python",
    ".js": "javascript",
    ".jsx": "javascript",
    ".ts": "typescript",
    ".tsx": "typescript",
    ".java": "java",
    ".cpp": "cpp",
    ".c": "c",
    ".go": "go",
    ".rs": "rust",
    ".rb": "ruby",
    ".php": "php",
    ".sql": "sql",
    ".html": "html",
    ".css": "css",
    ".json": "json",
    ".yaml": "yaml",
    ".yml": "yaml",
    ".xml": "xml",
    ".md": "markdown",
    ".markdown": "markdown",
    ".sh": "bash",
    ".bash": "bash",
};

export const MAX_TOTAL_IMAGE_BYTES = 10 * 1024 * 1024;

const getFileExtension = (filename: string): string => {
    const extension = filename.split(".").pop();
    return extension ? `.${extension.toLowerCase()}` : "";
};

export const isTextFile = (filename: string): boolean =>
    SUPPORTED_TEXT_FILE_EXTENSIONS.includes(
        getFileExtension(
            filename,
        ) as (typeof SUPPORTED_TEXT_FILE_EXTENSIONS)[number],
    );

export const getLanguageFromFilename = (filename: string): string | undefined =>
    LANGUAGE_MAP[getFileExtension(filename)];

export const toErrorMessage = (
    error: unknown,
    fallbackMessage: string,
): string => {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallbackMessage;
};
