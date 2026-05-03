import { Router } from "express";
import { db, sessionsTable, ratingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const ratingsRouter = Router();

ratingsRouter.post("/sessions/:sessionCode/rating", async (req, res) => {
  const { sessionCode } = req.params;
  const { stars, note } = req.body as { stars?: unknown; note?: unknown };

  if (typeof stars !== "number" || stars < 1 || stars > 5 || !Number.isInteger(stars)) {
    res.status(400).json({ error: "stars must be an integer between 1 and 5" });
    return;
  }

  try {
    const [session] = await db.select().from(sessionsTable).where(eq(sessionsTable.sessionCode, sessionCode));
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    const existing = await db.select().from(ratingsTable).where(eq(ratingsTable.sessionCode, sessionCode));
    if (existing.length > 0) {
      const [updated] = await db.update(ratingsTable)
        .set({ stars, note: typeof note === "string" ? note.trim().slice(0, 500) : null })
        .where(eq(ratingsTable.sessionCode, sessionCode))
        .returning();
      res.json({ id: updated.id, stars: updated.stars, note: updated.note });
      return;
    }

    const [rating] = await db.insert(ratingsTable).values({
      sessionId: session.id,
      sessionCode,
      stars,
      note: typeof note === "string" ? note.trim().slice(0, 500) : null,
    }).returning();

    res.status(201).json({ id: rating.id, stars: rating.stars, note: rating.note });
  } catch (err) {
    req.log.error({ err }, "Failed to save rating");
    res.status(500).json({ error: "Internal server error" });
  }
});

ratingsRouter.get("/sessions/:sessionCode/rating", async (req, res) => {
  const { sessionCode } = req.params;
  try {
    const [rating] = await db.select().from(ratingsTable).where(eq(ratingsTable.sessionCode, sessionCode));
    if (!rating) {
      res.status(404).json({ error: "No rating found" });
      return;
    }
    res.json({ id: rating.id, stars: rating.stars, note: rating.note, createdAt: rating.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch rating");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default ratingsRouter;
