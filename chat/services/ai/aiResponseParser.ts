import type { GradingResult, GradingStep } from "../../types";

const extractJsonObject = (text: string): string | null => {
    const fenced = text.match(/```json\s*([\s\S]*?)\s*```/i);
    if (fenced?.[1]) {
        return fenced[1];
    }

    const start = text.indexOf("{");
    if (start === -1) {
        return null;
    }

    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let index = start; index < text.length; index += 1) {
        const char = text[index];

        if (inString) {
            if (escaped) {
                escaped = false;
            } else if (char === "\\") {
                escaped = true;
            } else if (char === '"') {
                inString = false;
            }
            continue;
        }

        if (char === '"') {
            inString = true;
            continue;
        }

        if (char === "{") {
            depth += 1;
        }

        if (char === "}") {
            depth -= 1;
            if (depth === 0) {
                return text.slice(start, index + 1);
            }
        }
    }

    return null;
};

const tryRepairJsonObject = (text: string): string | null => {
    const start = text.indexOf("{");
    if (start === -1) {
        return null;
    }

    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let index = start; index < text.length; index += 1) {
        const char = text[index];

        if (inString) {
            if (escaped) {
                escaped = false;
            } else if (char === "\\") {
                escaped = true;
            } else if (char === '"') {
                inString = false;
            }
            continue;
        }

        if (char === '"') {
            inString = true;
            continue;
        }

        if (char === "{") {
            depth += 1;
        } else if (char === "}") {
            depth -= 1;
        }
    }

    let candidate = text.slice(start).trim();
    if (depth > 0) {
        candidate += "}".repeat(depth);
    }

    return candidate;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeGradingStep = (
    value: unknown,
    index: number,
): GradingStep | null => {
    if (!isRecord(value)) {
        return null;
    }

    const rawBbox = isRecord(value.bbox) ? value.bbox : {};

    return {
        stepNumber:
            typeof value.stepNumber === "number" ? value.stepNumber : index + 1,
        stepTitle:
            typeof value.stepTitle === "string"
                ? value.stepTitle
                : `步骤 ${index + 1}`,
        isCorrect: value.isCorrect === true,
        formula: typeof value.formula === "string" ? value.formula : "",
        text: typeof value.text === "string" ? value.text : "",
        comment: typeof value.comment === "string" ? value.comment : "",
        suggestion:
            typeof value.suggestion === "string" ? value.suggestion : undefined,
        correctFormula:
            typeof value.correctFormula === "string"
                ? value.correctFormula
                : undefined,
        bbox: {
            x: typeof rawBbox.x === "number" ? rawBbox.x : 0,
            y: typeof rawBbox.y === "number" ? rawBbox.y : 0,
            width: typeof rawBbox.width === "number" ? rawBbox.width : 0,
            height: typeof rawBbox.height === "number" ? rawBbox.height : 0,
        },
    };
};

const normalizeGradingSteps = (steps: unknown): GradingStep[] => {
    if (!Array.isArray(steps)) {
        return [];
    }

    return steps
        .map((step, index) => normalizeGradingStep(step, index))
        .filter((step): step is GradingStep => step !== null);
};

export const parseGradingResult = (
    aiReply: string,
    userImageUrls: string[],
): GradingResult | undefined => {
    try {
        const jsonPayload =
            extractJsonObject(aiReply) ?? tryRepairJsonObject(aiReply);
        if (!jsonPayload) {
            return undefined;
        }

        const gradingResult = JSON.parse(jsonPayload) as GradingResult & {
            imageGradingResult?: Array<Record<string, unknown>>;
            steps?: unknown[];
        };

        if (Array.isArray(gradingResult.imageGradingResult)) {
            gradingResult.imageGradingResult =
                gradingResult.imageGradingResult.map((imageRow, index) => ({
                    ...imageRow,
                    imageUrl:
                        index < userImageUrls.length
                            ? userImageUrls[index]
                            : typeof imageRow.imageUrl === "string"
                              ? imageRow.imageUrl
                              : "",
                }));
        } else if (userImageUrls.length > 0) {
            gradingResult.imageGradingResult = userImageUrls.map((url) => ({
                imageUrl: url,
                steps: normalizeGradingSteps(gradingResult.steps),
            }));
        }

        if (!isRecord(gradingResult)) {
            return undefined;
        }

        return gradingResult as GradingResult;
    } catch {
        return undefined;
    }
};
