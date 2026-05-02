import { Router } from "express";
import { db } from "@workspace/db";
import { sessionsTable, partnerResponsesTable, answersTable, questionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const reportsRouter = Router();

const CATEGORY_LABELS: Record<string, string> = {
  values: "Core Values",
  life_plans: "Life Plans",
  finances: "Finances",
  family: "Family & Children",
  lifestyle: "Lifestyle",
  communication: "Communication",
  intimacy: "Intimacy & Affection",
  growth: "Personal Growth",
};

function normalizeToScale(value: string, type: string, options: string[] | null): number {
  if (type === "scale") {
    const n = parseInt(value, 10);
    return isNaN(n) ? 3 : Math.min(5, Math.max(1, n));
  }
  if (type === "choice" && options && options.length > 0) {
    const idx = options.indexOf(value);
    if (idx === -1) return 3;
    return 1 + (idx / Math.max(1, options.length - 1)) * 4;
  }
  return -1;
}

function scoreDifference(v1: number, v2: number): number {
  if (v1 < 0 || v2 < 0) return 0.5;
  const diff = Math.abs(v1 - v2);
  if (diff <= 0.5) return 1.0;
  if (diff <= 1.0) return 0.85;
  if (diff <= 1.5) return 0.7;
  if (diff <= 2.0) return 0.5;
  if (diff <= 3.0) return 0.3;
  return 0.1;
}

function alignmentLabel(score: number): "high" | "medium" | "low" {
  if (score >= 0.75) return "high";
  if (score >= 0.5) return "medium";
  return "low";
}

function generateSummary(overallScore: number, p1Name: string, p2Name: string, categoryScores: Array<{ label: string; alignment: string }>): string {
  const highCount = categoryScores.filter(c => c.alignment === "high").length;
  const lowCount = categoryScores.filter(c => c.alignment === "low").length;

  if (overallScore >= 80) {
    return `${p1Name} and ${p2Name} show strong overall compatibility with deep alignment across most life areas. With ${highCount} highly aligned categories, you share a strong foundation of shared values and vision. Keep nurturing open dialogue around the areas where you differ — your differences can be your greatest strengths.`;
  } else if (overallScore >= 60) {
    return `${p1Name} and ${p2Name} have meaningful compatibility with many shared values and goals. While ${highCount} areas show strong alignment, there are ${lowCount > 0 ? lowCount + " areas" : "some topics"} that would benefit from deeper conversation and mutual understanding. These differences are navigable with honest communication.`;
  } else if (overallScore >= 40) {
    return `${p1Name} and ${p2Name} have some important areas of alignment, but this report highlights significant differences worth exploring together. The discussion prompts below are especially valuable — use them to understand each other's perspectives before making major decisions.`;
  } else {
    return `${p1Name} and ${p2Name} have quite different perspectives on several key life areas. This doesn't mean incompatibility is inevitable — it means honest, deep conversation is essential. Use this report as a starting point for the most important discussions of your relationship.`;
  }
}

reportsRouter.get("/sessions/:sessionCode/report", async (req, res) => {
  try {
    const { sessionCode } = req.params;
    const [session] = await db.select().from(sessionsTable).where(eq(sessionsTable.sessionCode, sessionCode));
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    const partner1Completed = !!session.partner1CompletedAt;
    const partner2Completed = !!session.partner2CompletedAt;

    if (!partner1Completed || !partner2Completed) {
      res.status(202).json({
        message: "Both partners must complete the questionnaire before a report can be generated.",
        partner1Completed,
        partner2Completed,
      });
      return;
    }

    const responseSets = await db.select()
      .from(partnerResponsesTable)
      .where(eq(partnerResponsesTable.sessionId, session.id));

    const p1Set = responseSets.find(r => r.partnerSlot === "partner1");
    const p2Set = responseSets.find(r => r.partnerSlot === "partner2");

    if (!p1Set || !p2Set) {
      res.status(202).json({
        message: "Response data incomplete.",
        partner1Completed,
        partner2Completed,
      });
      return;
    }

    const p1Answers = await db.select().from(answersTable).where(eq(answersTable.responseId, p1Set.id));
    const p2Answers = await db.select().from(answersTable).where(eq(answersTable.responseId, p2Set.id));
    const questions = await db.select().from(questionsTable);

    const p1Map = new Map(p1Answers.map(a => [a.questionId, a.value]));
    const p2Map = new Map(p2Answers.map(a => [a.questionId, a.value]));

    const categoryScoreMap: Record<string, { totalWeight: number; weightedScore: number }> = {};
    const alignedAreas: Array<object> = [];
    const differingAreas: Array<object> = [];

    for (const q of questions) {
      const v1 = p1Map.get(q.id);
      const v2 = p2Map.get(q.id);
      if (v1 === undefined || v2 === undefined) continue;

      const opts = q.options ? JSON.parse(q.options) : null;
      const s1 = normalizeToScale(v1, q.type, opts);
      const s2 = normalizeToScale(v2, q.type, opts);
      const score = scoreDifference(s1, s2);

      if (!categoryScoreMap[q.category]) {
        categoryScoreMap[q.category] = { totalWeight: 0, weightedScore: 0 };
      }
      categoryScoreMap[q.category].totalWeight += q.weight;
      categoryScoreMap[q.category].weightedScore += score * q.weight;

      const item = {
        questionId: q.id,
        questionText: q.text,
        category: q.category,
        partner1Answer: v1,
        partner2Answer: v2,
        note: null,
      };

      if (score >= 0.75) {
        alignedAreas.push(item);
      } else if (score < 0.6) {
        differingAreas.push(item);
      }
    }

    const categoryScores = Object.entries(categoryScoreMap).map(([category, data]) => {
      const score = data.totalWeight > 0 ? (data.weightedScore / data.totalWeight) * 100 : 50;
      return {
        category,
        label: CATEGORY_LABELS[category] ?? category,
        score: Math.round(score),
        alignment: alignmentLabel(data.weightedScore / data.totalWeight),
      };
    });

    const allWeightedScores = categoryScores.reduce((sum, c) => sum + c.score, 0);
    const overallScore = categoryScores.length > 0 ? Math.round(allWeightedScores / categoryScores.length) : 50;

    const discussionPrompts: string[] = [];
    for (const item of differingAreas.slice(0, 5)) {
      const d = item as { questionText: string; partner1Answer: string; partner2Answer: string };
      discussionPrompts.push(
        `You gave different answers to: "${d.questionText}". ${session.partner1Name} said "${d.partner1Answer}" while ${session.partner2Name ?? "your partner"} said "${d.partner2Answer}". What does this mean to each of you?`
      );
    }
    if (discussionPrompts.length < 3) {
      discussionPrompts.push(
        "What does a fulfilling life together look like to each of you in 10 years?",
        "How do you each handle disagreements — and how can you meet in the middle?",
        "What are the non-negotiables you each need to feel loved and respected?"
      );
    }

    const summary = generateSummary(overallScore, session.partner1Name, session.partner2Name ?? "your partner", categoryScores);

    res.json({
      sessionCode: session.sessionCode,
      partner1Name: session.partner1Name,
      partner2Name: session.partner2Name ?? "Partner 2",
      overallScore,
      categoryScores,
      alignedAreas: alignedAreas.slice(0, 8),
      differingAreas: differingAreas.slice(0, 8),
      discussionPrompts,
      summary,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to generate report");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default reportsRouter;
