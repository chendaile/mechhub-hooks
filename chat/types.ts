// BoundingBox for annotation overlay (percentage-based, 0-100)
export interface BoundingBox {
    x: number; // left position %
    y: number; // top position %
    width: number; // width %
    height: number; // height %
}

export type ChatMode = "study" | "correct";

export interface DeleteChatResult {
    success: boolean;
    wasCurrentSession: boolean;
}

export interface FileAttachment {
    filename: string;
    content: string;
    language?: string;
}

// Single grading step with location on image
export interface GradingStep {
    stepNumber: number;
    stepTitle: string;
    isCorrect: boolean;
    // Student's formula(s) in this step, should be wrapped with $...$ if present.
    formula?: string;
    // Student's textual explanation in this step.
    text?: string;
    comment: string;
    suggestion?: string;
    // If the step is incorrect, provide the corrected formula.
    correctFormula?: string;
    bbox: BoundingBox;
}

// Grading result for a single image
export interface ImageGradingResult {
    imageUrl: string;
    steps: GradingStep[];
}

export interface GradingResult {
    summary: string;
    imageGradingResult: ImageGradingResult[];
}

export interface OcrResult {
    imageUrl: string;
    text: string;
}

export interface SubmitMessage {
    text: string;
    mode: ChatMode;
    imageUrls?: string[];
    fileAttachments?: FileAttachment[];
    model: string;
}

export interface Message extends SubmitMessage {
    id: string;
    role: "user" | "assistant";
    type: "text" | "grading";
    gradingResult?: GradingResult;
    reasoning?: string;
    ocrText?: string;
    createdAt?: string;
}

export interface AICompletionRequest {
    messages: Message[];
    mode: "study" | "correct";
    imageUrls?: string[];
    fileAttachments?: FileAttachment[];
    ocrText?: string;
    model?: string;
}

export interface AICompletionResponse {
    text: string;
    gradingResult?: GradingResult;
    reasoning?: string;
}

// Callback for streaming content updates
export type StreamChunkType = "content" | "reasoning";
export interface StreamChunk {
    type: StreamChunkType;
    content: string;
}
export type StreamCallback = (chunk: StreamChunk) => void;

export interface AIStreamRequest extends AICompletionRequest {
    onChunk: StreamCallback;
}

export interface ChatSession {
    id: string;
    title: string;
    updatedAt: number;
    messages?: Message[];
    isGeneratingTitle?: boolean;
}
