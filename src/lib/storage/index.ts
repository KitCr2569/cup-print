import "server-only";
import { R2Storage, type R2Config } from "./r2";
import type { FileStorage } from "./storage";

const REQUIRED_ENVIRONMENT_VARIABLES = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
] as const;

export function readR2Config(
  environment: NodeJS.ProcessEnv = process.env,
): R2Config {
  const missingVariables = REQUIRED_ENVIRONMENT_VARIABLES.filter(
    (variableName) => !environment[variableName]?.trim(),
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing R2 environment variables: ${missingVariables.join(", ")}`,
    );
  }

  return {
    accountId: normalizeAccountId(environment.R2_ACCOUNT_ID!),
    accessKeyId: environment.R2_ACCESS_KEY_ID!.trim(),
    secretAccessKey: environment.R2_SECRET_ACCESS_KEY!.trim(),
    bucketName: environment.R2_BUCKET_NAME!.trim(),
  };
}

function normalizeAccountId(value: string): string {
  const normalizedValue = value.trim().replace(/^['"]|['"]$/g, "");
  if (!normalizedValue.includes("://")) {
    return normalizedValue;
  }

  const hostname = new URL(normalizedValue).hostname;
  const suffix = ".r2.cloudflarestorage.com";
  if (!hostname.endsWith(suffix)) {
    throw new Error("R2_ACCOUNT_ID must be a Cloudflare account ID or R2 endpoint URL");
  }

  return hostname.slice(0, -suffix.length);
}

let storage: FileStorage | undefined;

export function getFileStorage(): FileStorage {
  storage ??= new R2Storage(readR2Config());
  return storage;
}
