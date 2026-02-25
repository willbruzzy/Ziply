import { BlobServiceClient } from "@azure/storage-blob";
import { Response } from "express";

const CONTAINER_NAME = "ziply-zips";

let _client: BlobServiceClient | null = null;

function getClient(): BlobServiceClient {
  if (!_client) {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error(
        "AZURE_STORAGE_CONNECTION_STRING environment variable is not set"
      );
    }
    _client = BlobServiceClient.fromConnectionString(connectionString);
  }
  return _client;
}

/**
 * Uploads a ZIP buffer to Azure Blob Storage.
 * @param blobName - Path within the container (e.g. "{userId}/{generationId}.zip")
 * @param buffer - The ZIP file contents
 */
export async function uploadZip(
  blobName: string,
  buffer: Buffer
): Promise<void> {
  const client = getClient();
  const containerClient = client.getContainerClient(CONTAINER_NAME);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: "application/zip" },
  });
}

/**
 * Streams a ZIP blob directly to an Express response.
 * @param blobName - Path within the container
 * @param fileName - The filename sent in the Content-Disposition header
 * @param res - Express response object
 */
export async function streamZip(
  blobName: string,
  fileName: string,
  res: Response
): Promise<void> {
  const client = getClient();
  const containerClient = client.getContainerClient(CONTAINER_NAME);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  const download = await blockBlobClient.download(0);

  if (!download.readableStreamBody) {
    throw new Error("Blob stream is unavailable");
  }

  res.setHeader("Content-Type", "application/zip");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${fileName}"`
  );

  download.readableStreamBody.pipe(res);
}
