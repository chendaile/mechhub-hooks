import {
    AICompletionRequest,
    AICompletionResponse,
    GradingResult,
    Message,
} from "../types/message";
import { supabase, supabaseUrl, publicAnonKey } from "../../shared/supabase";

export class SupabaseAIGateway {
    private static isThinkingModel(model?: string): boolean {
        if (!model) return false;
        return model.includes("thinking");
    }

    private static buildSystemPrompt(
        mode: AICompletionRequest["mode"],
        userImageUrls: string[],
    ): string {
        if (mode === "correct") {
            return `你是一个严格的作业批改助手。用户上传了${userImageUrls.length}张作业图片。

请仔细分析每张图片中的解题过程，按照以下JSON格式返回批改结果（只返回JSON，不要其他内容）：

{
  "summary": "整体解题思路正确，但在第二步计算中有小错误",
  "imageGradingResult": [
    {
      "imageUrl": "对应的图片URL",
      "steps": [
        {
          "stepNumber": 1,
          "stepTitle": "受力分析",
          "isCorrect": true,
          "formula": "$\\sum F_x = 0$",
          "text": "列出水平方向受力平衡",
          "comment": "力的分析正确，方向和大小都标注清楚",
          "suggestion": null,
          "correctFormula": null,
          "bbox": { "x": 10, "y": 20, "width": 30, "height": 25 }
        },
        {
          "stepNumber": 2,
          "stepTitle": "力矩计算",
          "isCorrect": false,
          "formula": "$\\sum M_O = -F \\cdot l$",
          "text": "按顺时针为正进行力矩求和",
          "comment": "力矩的符号方向错误",
          "suggestion": "力矩应该根据右手定则判断正负",
          "correctFormula": "$\\sum M_O = +F \\cdot l$",
          "bbox": { "x": 15, "y": 50, "width": 40, "height": 30 }
        }
      ]
    }
  ]
}

注意：
1. bbox的x, y, width, height都是百分比(0-100)，表示在图片上的相对位置
2. 每个步骤都必须指定bbox来标注该步骤在图片上的位置
3. 每个步骤需要包含 formula（公式）与 text（文字说明），没有则用空字符串
4. 如果步骤有误，必须给出 correctFormula（正确修正公式）；如果正确则填 null
5. 图片顺序与用户上传顺序一致`;
        }

        return `你是一个精通理论力学的AI助教。你的目标是引导学生思考,而不是直接给出答案。

## 格式要求
- 使用 Markdown 格式回复`;
    }

    static parseGradingResult(
        aiReply: string,
        userImageUrls: string[],
    ): GradingResult | undefined {
        try {
            const jsonPayload = SupabaseAIGateway.extractJsonObject(aiReply);
            if (!jsonPayload) return undefined;

            const gradingResult = JSON.parse(jsonPayload);

            if (
                gradingResult.imageGradingResult &&
                Array.isArray(gradingResult.imageGradingResult)
            ) {
                gradingResult.imageGradingResult =
                    gradingResult.imageGradingResult.map(
                        (img: any, idx: number) => ({
                            ...img,
                            imageUrl:
                                idx < userImageUrls.length
                                    ? userImageUrls[idx]
                                    : img.imageUrl,
                        }),
                    );
            } else if (userImageUrls.length > 0) {
                gradingResult.imageGradingResult = userImageUrls.map(
                    (url, idx) => ({
                        imageUrl: url,
                        steps: gradingResult.steps || [],
                    }),
                );
            }

            return gradingResult as GradingResult;
        } catch (parseError) {
            console.error("Failed to parse grading JSON:", parseError);
            return undefined;
        }
    }
    private static getMessageText(
        message: Message & { content?: unknown },
    ): string {
        if (typeof message.text === "string") {
            return message.text;
        }
        if (typeof message.content === "string") {
            return message.content;
        }
        return "";
    }

    private static async getValidAccessToken(): Promise<string> {
        const {
            data: { session },
            error,
        } = await supabase.auth.getSession();

        if (error || !session) {
            throw new Error("未登录,请刷新页面重新登录");
        }

        const now = Math.floor(Date.now() / 1000);
        const willExpireSoon = !!session.expires_at && session.expires_at < now + 60;

        if (!willExpireSoon) {
            return session.access_token;
        }

        const { data: refreshed, error: refreshError } =
            await supabase.auth.refreshSession();

        if (refreshError || !refreshed.session) {
            throw new Error("登录已过期,请重新登录");
        }

        return refreshed.session.access_token;
    }

    private static extractJsonObject(text: string): string | null {
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

        for (let i = start; i < text.length; i++) {
            const ch = text[i];

            if (inString) {
                if (escaped) {
                    escaped = false;
                } else if (ch === "\\") {
                    escaped = true;
                } else if (ch === '"') {
                    inString = false;
                }
                continue;
            }

            if (ch === '"') {
                inString = true;
                continue;
            }

            if (ch === "{") depth += 1;
            if (ch === "}") {
                depth -= 1;
                if (depth === 0) {
                    return text.slice(start, i + 1);
                }
            }
        }

        return null;
    }

    static async getResponse(
        request: AICompletionRequest,
    ): Promise<AICompletionResponse> {
        const { messages, mode, fileAttachments, model } = request;

        const apiMessages = messages.map((m) => {
            if (
                m.role === "user" &&
                ((m.imageUrls && m.imageUrls.length > 0) ||
                    (m.fileAttachments && m.fileAttachments.length > 0))
            ) {
                let textContent = SupabaseAIGateway.getMessageText(m) || " ";

                // Append file content to message text
                if (m.fileAttachments && m.fileAttachments.length > 0) {
                    const fileContents = m.fileAttachments
                        .map((file) => {
                            const language = file.language || "text";
                            return `\n\n**File: ${file.filename}**\n\`\`\`${language}\n${file.content}\n\`\`\``;
                        })
                        .join("");
                    textContent += fileContents;
                }

                const contentParts: any[] = [
                    { type: "text", text: textContent },
                ];

                // Handle multiple images if present
                if (m.imageUrls && m.imageUrls.length > 0) {
                    m.imageUrls.forEach((url) => {
                        contentParts.push({
                            type: "image_url",
                            image_url: { url },
                        });
                    });
                }

                return {
                    role: m.role,
                    content: contentParts,
                };
            }

            // Handle messages with only file attachments (no images)
            if (
                m.role === "user" &&
                m.fileAttachments &&
                m.fileAttachments.length > 0
            ) {
                let textContent = SupabaseAIGateway.getMessageText(m) || " ";
                const fileContents = m.fileAttachments
                    .map((file) => {
                        const language = file.language || "text";
                        return `\n\n**File: ${file.filename}**\n\`\`\`${language}\n${file.content}\n\`\`\``;
                    })
                    .join("");
                textContent += fileContents;

                return {
                    role: m.role,
                    content: textContent,
                };
            }

            return {
                role: m.role,
                content: SupabaseAIGateway.getMessageText(m) || " ",
            };
        });

        // Get image URLs from the latest user message for grading mode
        const latestUserMessage = messages
            .filter((m) => m.role === "user")
            .pop();
        const userImageUrls = latestUserMessage?.imageUrls || [];

        const systemPrompt = SupabaseAIGateway.buildSystemPrompt(
            mode,
            userImageUrls,
        );

        const payloadMessages = [
            { role: "system", content: systemPrompt },
            ...apiMessages,
        ];

        const enableThinking = SupabaseAIGateway.isThinkingModel(model);
        const includeReasoning = enableThinking;

        const { data, error } = await supabase.functions.invoke(
            "chat-response",
            {
                body: {
                    messages: payloadMessages,
                    model,
                    enableThinking,
                    includeReasoning,
                },
            },
        );

        if (error) {
            console.error("AI Service Error:", error);
            throw new Error("AI 服务暂时不可用，请稍后再试。");
        }

        const aiReply = data.reply || "AI 没有返回内容。";
        const aiReasoning =
            typeof data.reasoning === "string" ? data.reasoning : "";

        // For grading mode, try to parse JSON response
        if (mode === "correct") {
            console.log(
                "[AIService] Grading mode - userImageUrls:",
                userImageUrls,
            );
            const gradingResult = SupabaseAIGateway.parseGradingResult(
                aiReply,
                userImageUrls,
            );
            if (gradingResult) {
                console.log(
                    "[AIService] Final gradingResult with imageUrls:",
                    gradingResult,
                );
                return {
                    text: aiReply,
                    gradingResult,
                    reasoning: aiReasoning,
                };
            }
        }

        return {
            text: aiReply,
            reasoning: aiReasoning,
        };
    }

    /**
     * Get AI response with streaming support
     * @param request - AI completion request with stream callback
     * @param abortSignal - Optional abort signal to cancel the stream
     * @returns Promise with final content
     */
    static async getResponseStream(
        request: AICompletionRequest,
        onChunk: (chunk: { type: "content" | "reasoning"; content: string }) => void,
        abortSignal?: AbortSignal,
    ): Promise<AICompletionResponse> {
        const { messages, mode, fileAttachments, model } = request;

        const apiMessages = messages.map((m) => {
            if (
                m.role === "user" &&
                ((m.imageUrls && m.imageUrls.length > 0) ||
                    (m.fileAttachments && m.fileAttachments.length > 0))
            ) {
                let textContent = SupabaseAIGateway.getMessageText(m) || " ";

                // Append file content to message text
                if (m.fileAttachments && m.fileAttachments.length > 0) {
                    const fileContents = m.fileAttachments
                        .map((file) => {
                            const language = file.language || "text";
                            return `\n\n**File: ${file.filename}**\n\`\`\`${language}\n${file.content}\n\`\`\``;
                        })
                        .join("");
                    textContent += fileContents;
                }

                const contentParts: any[] = [
                    { type: "text", text: textContent },
                ];

                // Handle multiple images if present
                if (m.imageUrls && m.imageUrls.length > 0) {
                    m.imageUrls.forEach((url) => {
                        contentParts.push({
                            type: "image_url",
                            image_url: { url },
                        });
                    });
                }

                return {
                    role: m.role,
                    content: contentParts,
                };
            }

            // Handle messages with only file attachments (no images)
            if (
                m.role === "user" &&
                m.fileAttachments &&
                m.fileAttachments.length > 0
            ) {
                let textContent = SupabaseAIGateway.getMessageText(m) || " ";
                const fileContents = m.fileAttachments
                    .map((file) => {
                        const language = file.language || "text";
                        return `\n\n**File: ${file.filename}**\n\`\`\`${language}\n${file.content}\n\`\`\``;
                    })
                    .join("");
                textContent += fileContents;

                return {
                    role: m.role,
                    content: textContent,
                };
            }

            return {
                role: m.role,
                content: SupabaseAIGateway.getMessageText(m) || " ",
            };
        });

        const latestUserMessage = messages
            .filter((m) => m.role === "user")
            .pop();
        const userImageUrls = latestUserMessage?.imageUrls || [];
        const systemPrompt = SupabaseAIGateway.buildSystemPrompt(
            mode,
            userImageUrls,
        );

        const payloadMessages = [
            { role: "system", content: systemPrompt },
            ...apiMessages,
        ];

        const enableThinking = SupabaseAIGateway.isThinkingModel(model);
        const includeReasoning = enableThinking;

        let accessToken = await SupabaseAIGateway.getValidAccessToken();

        const invokeStream = async (token: string) =>
            fetch(`${supabaseUrl}/functions/v1/chat-response`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    apikey: publicAnonKey,
                },
                body: JSON.stringify({
                    messages: payloadMessages,
                    stream: true,
                    model,
                    enableThinking,
                    includeReasoning,
                }),
                signal: abortSignal,
            });

        let response = await invokeStream(accessToken);

        if (response.status === 401) {
            const { data: refreshed, error: refreshError } =
                await supabase.auth.refreshSession();
            if (refreshError || !refreshed.session) {
                throw new Error("登录已过期,请重新登录");
            }
            accessToken = refreshed.session.access_token;
            response = await invokeStream(accessToken);
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error("AI Service Stream Error:", errorText);
            throw new Error("AI 服务暂时不可用,请稍后再试。");
        }

        if (!response.body) {
            throw new Error("No response body");
        }

        // 处理 SSE 流
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let fullContent = "";
        let fullReasoning = "";

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed || trimmed === "data: [DONE]") {
                        continue;
                    }

                    if (trimmed.startsWith("data: ")) {
                        try {
                            const jsonStr = trimmed.slice(6);
                            const data = JSON.parse(jsonStr);
                            const content = data.content;
                            const type =
                                data.type === "reasoning"
                                    ? "reasoning"
                                    : "content";

                            if (content) {
                                if (type === "reasoning") {
                                    fullReasoning += content;
                                } else {
                                    fullContent += content;
                                }
                                onChunk({ type, content });
                            }
                        } catch (e) {
                            console.error("Error parsing SSE data:", e);
                        }
                    }
                }
            }
        } catch (error) {
            if (error instanceof Error && error.name === "AbortError") {
                console.log("Stream aborted by user");
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
    }

    /**
     * Generate a concise title for a chat session based on messages
     * @param messages - Array of messages to analyze
     * @returns Generated title (5-30 characters)
     */
    static async generateTitle(messages: Message[]): Promise<string> {
        console.log("[AIService.generateTitle] Starting title generation...");

        // Only use first 2 messages (user question + AI answer) for title generation
        const recentMessages = messages.slice(0, 2);

        if (recentMessages.length === 0) {
            console.log(
                "[AIService.generateTitle] No messages, returning default",
            );
            return "新对话";
        }

        // Get first user message
        const firstMessage = recentMessages[0];

        // Create smart fallback title
        let fallbackTitle = "新对话";
        const firstMessageText = SupabaseAIGateway.getMessageText(firstMessage);
        if (firstMessageText && firstMessageText.trim()) {
            // Has text content
            fallbackTitle = firstMessageText.slice(0, 15);
        } else if (
            firstMessage.imageUrls &&
            firstMessage.imageUrls.length > 0
        ) {
            // Only has images
            fallbackTitle = "图片讨论";
        } else if (
            firstMessage.fileAttachments &&
            firstMessage.fileAttachments.length > 0
        ) {
            // Only has file attachments
            fallbackTitle = "文件讨论";
        }

        console.log("[AIService.generateTitle] Fallback title:", fallbackTitle);

        // Get AI response if available
        const aiResponse = recentMessages[1];

        // Prepare messages for title generation
        const titleMessages: { role: string; content: string }[] = [];

        // Add user message (with context about images/files if no text)
        if (firstMessageText && firstMessageText.trim()) {
            titleMessages.push({
                role: firstMessage.role,
                content: firstMessageText,
            });
        } else if (
            firstMessage.imageUrls &&
            firstMessage.imageUrls.length > 0
        ) {
            // User sent images without text
            titleMessages.push({
                role: "user",
                content: "用户上传了图片进行讨论",
            });
        } else if (
            firstMessage.fileAttachments &&
            firstMessage.fileAttachments.length > 0
        ) {
            titleMessages.push({
                role: "user",
                content: "用户上传了文件进行讨论",
            });
        }

        // Add AI response if available
        const aiResponseText = aiResponse
            ? SupabaseAIGateway.getMessageText(aiResponse)
            : "";
        if (aiResponseText && aiResponseText.trim()) {
            titleMessages.push({
                role: aiResponse.role,
                content: aiResponseText,
            });
        }

        // If still no messages with text, return fallback
        if (titleMessages.length === 0) {
            console.log(
                "[AIService.generateTitle] No content to generate title from",
            );
            return fallbackTitle;
        }

        try {
            console.log("[AIService.generateTitle] Calling Edge Function...");
            console.log(
                "[AIService.generateTitle] Title messages:",
                titleMessages,
            );

            const { data, error } = await supabase.functions.invoke(
                "chat-response",
                {
                    body: {
                        messages: [
                            {
                                role: "system",
                                content:
                                    "请用5-10个字总结下面对话的主题。只返回标题文本，不要其他内容。",
                            },
                            ...titleMessages,
                        ],
                    },
                },
            );

            console.log("[AIService.generateTitle] Edge Function response:", {
                data,
                error,
            });

            if (error) {
                console.error(
                    "[AIService.generateTitle] Edge Function error:",
                    error,
                );
                return fallbackTitle;
            }

            if (!data?.reply) {
                console.warn(
                    "[AIService.generateTitle] No reply in data:",
                    data,
                );
                return fallbackTitle;
            }

            const generatedTitle = data.reply.trim().slice(0, 30);
            console.log(
                "[AIService.generateTitle] Generated title:",
                generatedTitle,
            );
            return generatedTitle;
        } catch (error) {
            console.error("[AIService.generateTitle] Exception:", error);
            return fallbackTitle;
        }
    }
}

