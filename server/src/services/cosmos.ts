import { CosmosClient } from "@azure/cosmos";
import { GenerationRecord } from "../types/generation";

const DATABASE_ID = "ziply";
const CONTAINER_ID = "generations";

let _client: CosmosClient | null = null;

function getClient(): CosmosClient {
  if (!_client) {
    const endpoint = process.env.COSMOS_DB_ENDPOINT;
    const key = process.env.COSMOS_DB_KEY;
    if (!endpoint || !key) {
      throw new Error(
        "COSMOS_DB_ENDPOINT and COSMOS_DB_KEY environment variables must be set"
      );
    }
    _client = new CosmosClient({ endpoint, key });
  }
  return _client;
}

function getContainer() {
  return getClient()
    .database(DATABASE_ID)
    .container(CONTAINER_ID);
}

/**
 * Inserts a new GenerationRecord into Cosmos DB.
 */
export async function createGenerationRecord(
  record: GenerationRecord
): Promise<void> {
  await getContainer().items.create(record);
}

/**
 * Fetches a GenerationRecord by id and userId (partition key).
 * Returns null if not found.
 */
export async function getGenerationRecord(
  id: string,
  userId: string
): Promise<GenerationRecord | null> {
  const { resource } = await getContainer()
    .item(id, userId)
    .read<GenerationRecord>();

  return resource ?? null;
}

/**
 * Marks a GenerationRecord as paid.
 * Called by the Stripe webhook handler in Phase 1.7.
 */
export async function markGenerationPaid(
  id: string,
  userId: string,
  stripeSessionId: string
): Promise<void> {
  const record = await getGenerationRecord(id, userId);
  if (!record) throw new Error(`Generation record ${id} not found`);

  const updated: GenerationRecord = {
    ...record,
    paid: true,
    paidAt: new Date().toISOString(),
    stripeSessionId,
  };

  await getContainer().item(id, userId).replace(updated);
}
