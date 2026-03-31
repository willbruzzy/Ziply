import { BlobServiceClient } from "@azure/storage-blob";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_MIME_TYPES_LIST = [...ALLOWED_MIME_TYPES];

function getBlobServiceClient(): BlobServiceClient {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error("AZURE_STORAGE_CONNECTION_STRING is not set");
  }
  return BlobServiceClient.fromConnectionString(connectionString);
}

function getContainerName(): string {
  return process.env.AZURE_STORAGE_CONTAINER_NAME ?? "ziply-uploads";
}

/**
 * Uploads an image buffer to Azure Blob Storage and returns the public URL.
 *
 * @param buffer       File contents as a Buffer.
 * @param mimeType     MIME type of the file (must be JPEG, PNG, or WebP).
 * @param originalName Original filename, used to preserve the extension.
 * @returns            Public blob URL.
 */
export async function uploadImage(
  buffer: Buffer,
  mimeType: string,
  originalName: string
): Promise<string> {
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error("File exceeds the 5 MB size limit");
  }

  const ext = originalName.split(".").pop() ?? "jpg";
  const blobName = `images/${crypto.randomUUID()}.${ext}`;

  const client = getBlobServiceClient();
  const containerClient = client.getContainerClient(getContainerName());
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.upload(buffer, buffer.length, {
    blobHTTPHeaders: { blobContentType: mimeType },
  });

  return blockBlobClient.url;
}
