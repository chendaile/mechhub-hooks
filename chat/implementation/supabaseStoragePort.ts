import type { StoragePort } from "../interface/StoragePort";
import { StorageService } from "./supabaseStorageService";

export const createSupabaseStoragePort = (): StoragePort => ({
    uploadImage: (file) => StorageService.uploadImage(file),
});
