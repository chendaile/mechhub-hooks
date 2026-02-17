import { supabase } from "../../shared/supabase";

export interface AvatarUploadResult {
    publicUrl: string;
    storagePath: string;
}

const buildAvatarPath = (userId: string, filename: string) => {
    const ext = filename.split(".").pop() || "png";
    const suffix = Math.random().toString(36).slice(2, 8);
    return `${userId}/avatar-${Date.now()}-${suffix}.${ext}`;
};

export const uploadAvatar = async (
    userId: string,
    file: File,
): Promise<AvatarUploadResult> => {
    const storagePath = buildAvatarPath(userId, file.name);
    const { error: uploadError } = await supabase.storage
        .from("user-avatars")
        .upload(storagePath, file, {
            contentType: file.type,
            upsert: false,
        });

    if (uploadError) {
        throw uploadError;
    }

    const {
        data: { publicUrl },
    } = supabase.storage.from("user-avatars").getPublicUrl(storagePath);

    const objectSegment = "/storage/v1/object/";
    const publicSegment = "/storage/v1/object/public/";
    let normalizedUrl = publicUrl;
    if (
        normalizedUrl.includes(objectSegment) &&
        !normalizedUrl.includes(publicSegment)
    ) {
        normalizedUrl = normalizedUrl.replace(objectSegment, publicSegment);
    }
    if (normalizedUrl.includes(`${publicSegment}public/`)) {
        normalizedUrl = normalizedUrl.replace(
            `${publicSegment}public/`,
            publicSegment,
        );
    }

    return {
        publicUrl: normalizedUrl,
        storagePath,
    };
};
