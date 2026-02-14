import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { findUserByEmail, createUser } from "../store/userStore";
import { AuthPayload } from "../types/user";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "";
const SALT_ROUNDS = 10;

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    if (findUserByEmail(email)) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = createUser({
      id: crypto.randomUUID(),
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
    });

    const payload: AuthPayload = { userId: user.id, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });

    res.status(201).json({ token, user: { id: user.id, email: user.email } });
  } catch {
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const user = findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const payload: AuthPayload = { userId: user.id, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });

    res.json({ token, user: { id: user.id, email: user.email } });
  } catch {
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/logout", authenticate, (_req: AuthRequest, res: Response) => {
  res.json({ message: "Logged out successfully" });
});

export default router;
