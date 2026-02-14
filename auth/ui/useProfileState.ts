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

    const state = {
        name,
        role: user.role,
        avatar,
        isEditing,
    };

    const derived = {
        containerVariants: {
            hidden: { opacity: 0 },
            visible: {
                opacity: 1,
                transition: { staggerChildren: 0.08 },
            },
        },
        itemVariants: {
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0 },
        },
    };

    const actions = {
        setName,
        setAvatar,
        setIsEditing,
        handleSave,
        handleCancel,
    };

    return {
        state,
        actions,
        derived,
        name: state.name,
        setName: actions.setName,
        role: state.role,
        avatar: state.avatar,
        setAvatar: actions.setAvatar,
        isEditing: state.isEditing,
        setIsEditing: actions.setIsEditing,
        handleSave: actions.handleSave,
        handleCancel: actions.handleCancel,
        containerVariants: derived.containerVariants,
        itemVariants: derived.itemVariants,
    };
};
