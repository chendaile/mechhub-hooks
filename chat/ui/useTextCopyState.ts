import { useState } from "react";
import { toast } from "sonner";

export const useTextCopyState = (text: string) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopyText = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setIsCopied(true);
            toast.success("已复制到剪贴板");
            setTimeout(() => setIsCopied(false), 2000);
        } catch (error) {
            toast.error("复制失败");
        }
    };

    return {
        isCopied,
        handleCopyText,
    };
};
