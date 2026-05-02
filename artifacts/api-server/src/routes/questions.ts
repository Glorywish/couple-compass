import { Router } from "express";
import { db } from "@workspace/db";
import { questionsTable } from "@workspace/db";

const questionsRouter = Router();

questionsRouter.get("/questions", async (req, res) => {
  try {
    const questions = await db.select().from(questionsTable).orderBy(questionsTable.category, questionsTable.id);
    const formatted = questions.map((q) => ({
      id: q.id,
      category: q.category,
      text: q.text,
      type: q.type,
      options: q.options ? JSON.parse(q.options) : null,
      weight: q.weight,
    }));
    res.json(formatted);
  } catch (err) {
    req.log.error({ err }, "Failed to list questions");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default questionsRouter;
