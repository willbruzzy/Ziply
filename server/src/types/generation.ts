/**
 * A generation record stored in Cosmos DB.
 * Tracks the ZIP artifact associated with a user's site generation request.
 */
export interface GenerationRecord {
  /** Unique generation ID (UUID). Used as the Cosmos DB document id. */
  id: string;
  /** ID of the user who triggered this generation. Cosmos DB partition key. */
  userId: string;
  /** Template used for this generation. */
  templateId: string;
  /** Blob name in Azure Blob Storage (format: "{userId}/{id}.zip"). */
  blobName: string;
  /** Whether payment has been confirmed via Stripe webhook. */
  paid: boolean;
  /** ISO timestamp of when this record was created. */
  createdAt: string;
  /** ISO timestamp of when payment was confirmed. Set by Stripe webhook in 1.7. */
  paidAt?: string;
  /** Stripe Checkout session ID. Set when checkout session is created in 1.7. */
  stripeSessionId?: string;
}
