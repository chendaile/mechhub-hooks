export interface UploadResult {
    publicUrl: string;
    storagePath: string;
}

export interface StoragePort {
    uploadImage(file: File): Promise<UploadResult>;
}
