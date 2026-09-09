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
    accessKeyId: normalizeCredential(environment.R2_ACCESS_KEY_ID!, "R2_ACCESS_KEY_ID"),
    secretAccessKey: normalizeCredential(environment.R2_SECRET_ACCESS_KEY!, "R2_SECRET_ACCESS_KEY"),
    bucketName: normalizeBucketName(environment.R2_BUCKET_NAME!),
  };
}

function normalizeAccountId(value: string): string {
  const normalizedValue = value.trim().replace(/^['"]|['"]$/g, "");
  const accountId = normalizedValue.match(/[a-f0-9]{32}/i)?.[0];
  if (!accountId) {
    throw new Error("R2_ACCOUNT_ID must contain a 32-character Cloudflare account ID");
  }

  return accountId;
}

function normalizeCredential(value: string, name: string): string {
  const normalizedValue = value.replace(/[\r\n\t ]/g, "").replace(/^['"]|['"]$/g, "");
  if (!normalizedValue || /[^\x21-\x7E]/.test(normalizedValue)) {
    throw new Error(`${name} contains invalid characters`);
  }
  return normalizedValue;
}

function normalizeBucketName(value: string): string {
  const normalizedValue = value.trim().replace(/^['"]|['"]$/g, "");
  if (!/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(normalizedValue)) {
    throw new Error("R2_BUCKET_NAME is invalid");
  }
  return normalizedValue;
}

let storage: FileStorage | undefined;

export function getFileStorage(): FileStorage {
  storage ??= new R2Storage(readR2Config());
  return storage;
}
