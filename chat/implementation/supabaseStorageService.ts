import { supabase } from "../../shared/supabase";

export interface UploadResult {
    publicUrl: string;
    storagePath: string;
}

export interface StorageAdapter {
    uploadImage: (file: File) => Promise<UploadResult>;
}

const createSupabaseAdapter = (): StorageAdapter => ({
    uploadImage: async (file) => {
        const fileExt = file.name.split(".").pop();
        const sanitizedFileName = `${Date.now()}_${Math.random().toString(36).substr(2, 5)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from("chat-images")
            .upload(sanitizedFileName, file, {
                contentType: file.type,
                upsert: false,
            });

        if (uploadError) {
            throw uploadError;
        }

        const {
            data: { publicUrl },
        } = supabase.storage
            .from("chat-images")
            .getPublicUrl(sanitizedFileName);

        return {
            publicUrl,
            storagePath: sanitizedFileName,
        };
    },
});

const adapter: StorageAdapter = createSupabaseAdapter();

export const StorageService = {
    uploadImage: (file: File) => adapter.uploadImage(file),
};
