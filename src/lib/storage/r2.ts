import "server-only";
import {
  GetObjectCommand,
  NoSuchKey,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import { createObjectKey, validateObjectKey } from "./storage-path";
import type { FileStorage, StoredFile } from "./storage";

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
}

export class R2Storage implements FileStorage {
  private readonly client: S3Client;

  constructor(private readonly config: R2Config) {
    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async storeFile(folder: string, file: Blob, extension: string): Promise<string> {
    const objectKey = createObjectKey(folder, randomUUID(), extension);
    const bytes = new Uint8Array(await file.arrayBuffer());

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.bucketName,
        Key: objectKey,
        Body: bytes,
        ContentLength: bytes.byteLength,
        ContentType: file.type || "application/octet-stream",
      }),
    );

    return objectKey;
  }

  async loadFile(storagePath: string): Promise<StoredFile | null> {
    const objectKey = validateObjectKey(storagePath);

    try {
      const result = await this.client.send(
        new GetObjectCommand({
          Bucket: this.config.bucketName,
          Key: objectKey,
        }),
      );

      if (!result.Body) {
        throw new Error(`R2 object has no body: ${objectKey}`);
      }

      return {
        bytes: await result.Body.transformToByteArray(),
        contentType: result.ContentType,
      };
    } catch (error) {
      if (error instanceof NoSuchKey || isNotFoundError(error)) {
        return null;
      }

      throw error;
    }
  }
}

function isNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const metadata = "$metadata" in error ? error.$metadata : undefined;
  if (!metadata || typeof metadata !== "object") {
    return false;
  }

  return "httpStatusCode" in metadata && metadata.httpStatusCode === 404;
}
