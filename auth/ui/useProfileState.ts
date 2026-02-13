import { useEffect, useState } from "react";
import { UserProfile } from "../../auth/types";

const DEFAULT_USER = {
    name: "张同学",
    avatar: "",
    role: "机械工程专业学生",
};

export const useProfileState = (
    user: UserProfile = DEFAULT_USER,
    onUpdateProfile: (name: string, avatar: string) => void = () => {},
) => {
    const [name, setName] = useState(user.name);
    const [avatar, setAvatar] = useState(user.avatar);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setName(user.name);
        setAvatar(user.avatar);
    }, [user]);

    const handleSave = () => {
        onUpdateProfile(name, avatar);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setName(user.name);
        setAvatar(user.avatar);
        setIsEditing(false);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 24,
            } as const,
        },
    };

    return {
        name,
        setName,
        role: user.role,
        avatar,
        setAvatar,
        isEditing,
        setIsEditing,
        handleSave,
        handleCancel,
        containerVariants,
        itemVariants,
    };
};
