import { Router } from "express";
import { db } from "@workspace/db";
import { sessionsTable, partnerResponsesTable, answersTable, questionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const responsesRouter = Router();

responsesRouter.post("/sessions/:sessionCode/responses", async (req, res) => {
  try {
    const { sessionCode } = req.params;
    const { partnerSlot, partnerName, answers } = req.body;

    if (!partnerSlot || !["partner1", "partner2"].includes(partnerSlot)) {
      res.status(400).json({ error: "partnerSlot must be 'partner1' or 'partner2'" });
      return;
    }
    if (!partnerName || typeof partnerName !== "string") {
      res.status(400).json({ error: "partnerName is required" });
      return;
    }
    if (!Array.isArray(answers) || answers.length === 0) {
      res.status(400).json({ error: "answers must be a non-empty array" });
      return;
    }

    const [session] = await db.select().from(sessionsTable).where(eq(sessionsTable.sessionCode, sessionCode));
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    const existing = await db.select()
      .from(partnerResponsesTable)
      .where(and(
        eq(partnerResponsesTable.sessionId, session.id),
        eq(partnerResponsesTable.partnerSlot, partnerSlot)
      ));
    if (existing.length > 0) {
      res.status(409).json({ error: "This partner has already submitted responses" });
      return;
    }

    const [responseSet] = await db.insert(partnerResponsesTable).values({
      sessionId: session.id,
      partnerSlot,
      partnerName: partnerName.trim(),
    }).returning();

    const answerRows = answers.map((a: { questionId: number; value: string }) => ({
      responseId: responseSet.id,
      questionId: a.questionId,
      value: String(a.value),
    }));
    await db.insert(answersTable).values(answerRows);

    const now = new Date();
    if (partnerSlot === "partner1") {
      await db.update(sessionsTable)
        .set({ partner1CompletedAt: now, partner1Name: partnerName.trim() })
        .where(eq(sessionsTable.id, session.id));
    } else {
      await db.update(sessionsTable)
        .set({ partner2CompletedAt: now, partner2Name: partnerName.trim() })
        .where(eq(sessionsTable.id, session.id));
    }

    res.status(201).json({
      id: responseSet.id,
      sessionId: responseSet.sessionId,
      partnerSlot: responseSet.partnerSlot,
      partnerName: responseSet.partnerName,
      submittedAt: responseSet.submittedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to submit responses");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default responsesRouter;
