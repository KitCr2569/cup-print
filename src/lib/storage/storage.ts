export interface StoredFile {
  bytes: Uint8Array;
  contentType?: string;
}

export interface FileStorage {
  storeFile(
    folder: string,
    file: Blob,
    extension: string,
  ): Promise<string>;
  loadFile(storagePath: string): Promise<StoredFile | null>;
}
