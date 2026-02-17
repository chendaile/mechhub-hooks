import { publicAnonKey, supabase, supabaseUrl } from "../../../shared/supabase";
import type { AICompletionResponse, StreamChunk } from "../../types";

interface StreamInvokePayload {
    messages: Array<{
        role: string;
        content: unknown;
    }>;
    mode?: "study" | "correct";
    imageUrls?: string[];
    ocrText?: string;
    model?: string;
    enableThinking: boolean;
    includeReasoning: boolean;
}

const getValidAccessToken = async (): Promise<string> => {
    const {
        data: { session },
        error,
    } = await supabase.auth.getSession();

    if (error || !session) {
        throw new Error("未登录,请刷新页面重新登录");
    }

    const now = Math.floor(Date.now() / 1000);
    const willExpireSoon =
        !!session.expires_at && session.expires_at < now + 60;

    if (!willExpireSoon) {
        return session.access_token;
    }

    const { data: refreshed, error: refreshError } =
        await supabase.auth.refreshSession();

    if (refreshError || !refreshed.session) {
        throw new Error("登录已过期,请重新登录");
    }

    return refreshed.session.access_token;
};

const invokeStream = async (
    token: string,
    payload: StreamInvokePayload,
    abortSignal?: AbortSignal,
) =>
    fetch(`${supabaseUrl}/functions/v1/chat-response`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            apikey: publicAnonKey,
        },
        body: JSON.stringify({
            ...payload,
            stream: true,
        }),
        signal: abortSignal,
    });

const parseSseLine = (line: string): StreamChunk | null => {
    const trimmed = line.trim();
    if (
        !trimmed ||
        trimmed === "data: [DONE]" ||
        !trimmed.startsWith("data: ")
    ) {
        return null;
    }

    const jsonText = trimmed.slice(6);
    const parsed = JSON.parse(jsonText) as {
        type?: unknown;
        content?: unknown;
    };

    if (typeof parsed.content !== "string" || !parsed.content) {
        return null;
    }

    return {
        type: parsed.type === "reasoning" ? "reasoning" : "content",
        content: parsed.content,
    };
};

export const streamChatResponse = async (
    payload: StreamInvokePayload,
    onChunk: (chunk: StreamChunk) => void,
    abortSignal?: AbortSignal,
): Promise<AICompletionResponse> => {
    let accessToken = await getValidAccessToken();
    let response = await invokeStream(accessToken, payload, abortSignal);

    if (response.status === 401) {
        const { data: refreshed, error: refreshError } =
            await supabase.auth.refreshSession();
        if (refreshError || !refreshed.session) {
            throw new Error("登录已过期,请重新登录");
        }

        accessToken = refreshed.session.access_token;
        response = await invokeStream(accessToken, payload, abortSignal);
    }

    if (!response.ok) {
        throw new Error("AI 服务暂时不可用,请稍后再试。");
    }

    if (!response.body) {
        throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullContent = "";
    let fullReasoning = "";

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
                try {
                    const chunk = parseSseLine(line);
                    if (!chunk) {
                        continue;
                    }

                    if (chunk.type === "reasoning") {
                        fullReasoning += chunk.content;
                    } else {
                        fullContent += chunk.content;
                    }

                    onChunk(chunk);
                } catch {
                    continue;
                }
            }
        }
    } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
            return {
                text: fullContent || "生成已停止",
            };
        }

        throw error;
    }

    return {
        text: fullContent,
        reasoning: fullReasoning,
    };
};
