import { Router, Request, Response } from "express";
import Stripe from "stripe";
import { authenticate, AuthRequest } from "../middleware/auth";
import { getGenerationRecord, markGenerationPaid } from "../services/cosmos";

const router = Router();

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY environment variable must be set");
  return new Stripe(key);
}

/**
 * POST /api/stripe/create-session
 * Creates a Stripe Checkout session for a $29 one-time payment.
 * Requires authentication.
 *
 * Body:
 *   { generationId: string }
 *
 * Response:
 *   { sessionUrl: string }
 */
router.post(
  "/create-session",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    const { generationId } = req.body as { generationId?: string };

    if (!generationId || typeof generationId !== "string") {
      res.status(400).json({ error: "generationId is required" });
      return;
    }

    const userId = req.user!.userId;

    try {
      // Verify the generation record exists and belongs to this user
      const record = await getGenerationRecord(generationId, userId);
      if (!record) {
        res.status(404).json({ error: "Generation not found" });
        return;
      }

      if (record.paid) {
        res.status(400).json({ error: "This generation has already been paid for" });
        return;
      }

      const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
      const stripe = getStripe();

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: 2900, // $29.00
              product_data: {
                name: "Ziply Website Package",
                description: `Static website ZIP — ${record.templateId}`,
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          generationId,
          userId,
        },
        success_url: `${clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${clientUrl}/payment/cancel`,
      });

      if (!session.url) {
        res.status(500).json({ error: "Failed to create checkout session" });
        return;
      }

      res.json({ sessionUrl: session.url });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create checkout session";
      res.status(500).json({ error: message });
    }
  }
);

/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events. Verifies signature and processes
 * checkout.session.completed to mark generations as paid.
 *
 * NOTE: This endpoint requires the raw request body for signature verification.
 * The raw body middleware is configured in index.ts.
 */
router.post("/webhook", async (req: Request, res: Response) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    // eslint-disable-next-line no-console
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    res.status(500).json({ error: "Webhook not configured" });
    return;
  }

  const sig = req.headers["stripe-signature"] as string | undefined;
  if (!sig) {
    res.status(400).json({ error: "Missing stripe-signature header" });
    return;
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Signature verification failed";
    // eslint-disable-next-line no-console
    console.error("Webhook signature verification failed:", message);
    res.status(400).json({ error: `Webhook Error: ${message}` });
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const generationId = session.metadata?.generationId;
    const userId = session.metadata?.userId;

    if (generationId && userId) {
      try {
        await markGenerationPaid(generationId, userId, session.id);
        // eslint-disable-next-line no-console
        console.log(`Payment confirmed for generation ${generationId}`);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to mark generation as paid:", err);
        // Return 500 so Stripe retries the webhook
        res.status(500).json({ error: "Failed to process payment confirmation" });
        return;
      }
    } else {
      // eslint-disable-next-line no-console
      console.error("Webhook missing metadata:", session.metadata);
    }
  }

  // Acknowledge receipt
  res.json({ received: true });
});

/**
 * GET /api/stripe/session-status/:sessionId
 * Returns the payment status for a Stripe Checkout session.
 * Used by the success page to verify payment went through.
 * Requires authentication.
 */
router.get(
  "/session-status/:sessionId",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    const sessionId = req.params.sessionId as string;

    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      const generationId = session.metadata?.generationId;
      const userId = req.user!.userId;

      // Verify the session belongs to this user
      if (session.metadata?.userId !== userId) {
        res.status(403).json({ error: "Unauthorized" });
        return;
      }

      res.json({
        status: session.payment_status,
        generationId,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to retrieve session";
      res.status(500).json({ error: message });
    }
  }
);

export default router;
