import type { AssignmentAttachment } from "../types";
import { supabase } from "../../shared/supabase";

const buildStoragePath = (filename: string) => {
    const extension = filename.includes(".")
        ? filename.split(".").pop() || "bin"
        : "bin";
    const nonce = Math.random().toString(36).slice(2, 8);
    return `${Date.now()}_${nonce}.${extension}`;
};

export const uploadAssignmentAttachments = async (
    files: File[],
): Promise<AssignmentAttachment[]> => {
    if (!files.length) {
        return [];
    }

    const bucket = supabase.storage.from("assignment-attachments");
    const uploads: AssignmentAttachment[] = [];

    for (const file of files) {
        const storagePath = buildStoragePath(file.name);
        const contentType = file.type || "application/octet-stream";

        const { error: uploadError } = await bucket.upload(
            storagePath,
            file,
            {
                contentType,
                upsert: false,
            },
        );

        if (uploadError) {
            throw uploadError;
        }

        const {
            data: { publicUrl },
        } = bucket.getPublicUrl(storagePath);

        uploads.push({
            name: file.name,
            url: publicUrl,
            size: file.size,
            contentType: file.type || undefined,
            storagePath,
        });
    }

    return uploads;
};
