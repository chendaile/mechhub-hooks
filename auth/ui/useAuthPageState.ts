import { useState } from "react";
import { toast } from "sonner";
import { AuthMode } from "../types";
import { authUseCases } from "../interface/authUseCases";

export const useAuthPageState = (onLoginSuccess: () => void) => {
    const [mode, setMode] = useState<AuthMode>("signin");
    const [isVerificationPending, setIsVerificationPending] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (mode === "signin") {
                await authUseCases.signIn(email, password);
                toast.success("欢迎回来！");
                onLoginSuccess();
            } else if (mode === "register") {
                await authUseCases.signUp(email, password);
                setIsVerificationPending(true);
                toast.success("账户创建成功！请检查您的邮箱完成验证。");
            }
        } catch (error: any) {
            toast.error(error.message || "认证失败");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = async (provider: "google" | "github") => {
        setIsLoading(true);
        try {
            await authUseCases.socialLogin(provider);
        } catch (error: any) {
            toast.error(error.message || "认证失败");
        } finally {
            setIsLoading(false);
        }
    };

    return {
        mode,
        setMode,
        email,
        setEmail,
        password,
        setPassword,
        isLoading,
        showPassword,
        setShowPassword,
        handleSubmit,
        handleSocialLogin,
        isVerificationPending,
        setIsVerificationPending,
    };
};
