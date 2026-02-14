export type ShareIntent =
    | { kind: "chatMessage"; messageId: string }
    | { kind: "chatSession"; sessionId: string }
    | { kind: "gradeFeedback" };
