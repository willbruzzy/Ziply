import "./env"; // must be first — loads .env before any other module reads process.env
import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth";
import generateRoutes from "./routes/generate";
import stripeRoutes from "./routes/stripe";
import uploadRoutes from "./routes/upload";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));

// Stripe webhook needs raw body for signature verification — register before json parser
app.use(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" })
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api", generateRoutes);
app.use("/api", uploadRoutes);
app.use("/api/stripe", stripeRoutes);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Ziply server running on port ${PORT}`);
});

export default app;
