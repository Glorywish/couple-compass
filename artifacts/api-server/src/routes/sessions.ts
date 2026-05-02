import { Router } from "express";
import { db } from "@workspace/db";
import { sessionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";

const sessionsRouter = Router();

function generateCode(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}

sessionsRouter.post("/sessions", async (req, res) => {
  try {
    const { partner1Name } = req.body;
    if (!partner1Name || typeof partner1Name !== "string") {
      res.status(400).json({ error: "partner1Name is required" });
      return;
    }

    let sessionCode = generateCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await db.select().from(sessionsTable).where(eq(sessionsTable.sessionCode, sessionCode));
      if (existing.length === 0) break;
      sessionCode = generateCode();
      attempts++;
    }

    const [session] = await db.insert(sessionsTable).values({
      sessionCode,
      partner1Name: partner1Name.trim(),
    }).returning();

    res.status(201).json({
      id: session.id,
      sessionCode: session.sessionCode,
      partner1Name: session.partner1Name,
      partner2Name: session.partner2Name ?? null,
      createdAt: session.createdAt.toISOString(),
      partner1CompletedAt: session.partner1CompletedAt?.toISOString() ?? null,
      partner2CompletedAt: session.partner2CompletedAt?.toISOString() ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create session");
    res.status(500).json({ error: "Internal server error" });
  }
});

sessionsRouter.get("/sessions/:sessionCode", async (req, res) => {
  try {
    const { sessionCode } = req.params;
    const [session] = await db.select().from(sessionsTable).where(eq(sessionsTable.sessionCode, sessionCode));
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    res.json({
      id: session.id,
      sessionCode: session.sessionCode,
      partner1Name: session.partner1Name,
      partner2Name: session.partner2Name ?? null,
      createdAt: session.createdAt.toISOString(),
      partner1CompletedAt: session.partner1CompletedAt?.toISOString() ?? null,
      partner2CompletedAt: session.partner2CompletedAt?.toISOString() ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get session");
    res.status(500).json({ error: "Internal server error" });
  }
});

sessionsRouter.get("/sessions/:sessionCode/status", async (req, res) => {
  try {
    const { sessionCode } = req.params;
    const [session] = await db.select().from(sessionsTable).where(eq(sessionsTable.sessionCode, sessionCode));
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    const partner1Completed = !!session.partner1CompletedAt;
    const partner2Completed = !!session.partner2CompletedAt;
    res.json({
      sessionCode: session.sessionCode,
      partner1Name: session.partner1Name,
      partner2Name: session.partner2Name ?? null,
      partner1Completed,
      partner2Completed,
      bothCompleted: partner1Completed && partner2Completed,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get session status");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default sessionsRouter;
