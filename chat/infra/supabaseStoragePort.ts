import type { StoragePort } from "../application/ports/StoragePort";
import { StorageService } from "./supabaseStorageAdapter";

export const createSupabaseStoragePort = (): StoragePort => ({
    uploadImage: (file) => StorageService.uploadImage(file),
});
