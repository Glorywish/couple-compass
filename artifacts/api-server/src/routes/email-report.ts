import { Router } from "express";
import { db, sessionsTable, responseSetsTable, answersTable, questionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const emailReportRouter = Router();

function scoreLabel(score: number): string {
  if (score >= 80) return "Beautifully aligned";
  if (score >= 60) return "Strongly compatible";
  if (score >= 40) return "Good foundation";
  return "Worth exploring together";
}

function categoryLabel(cat: string): string {
  const map: Record<string, string> = {
    values: "Values", life_plans: "Life Plans", finances: "Finances",
    family: "Family", lifestyle: "Lifestyle", communication: "Communication",
    intimacy: "Intimacy", growth: "Growth",
  };
  return map[cat] ?? cat;
}

function scoreColor(score: number): string {
  if (score >= 75) return "#e8607a";
  if (score >= 50) return "#d4a853";
  return "#b8d4f0";
}

function buildEmailHtml(data: {
  partner1Name: string;
  partner2Name: string;
  overallScore: number;
  categoryScores: Array<{ category: string; score: number; alignment: string }>;
  alignedAreas: Array<{ questionText: string; partner1Answer: string; partner2Answer: string }>;
  differingAreas: Array<{ questionText: string; partner1Answer: string; partner2Answer: string }>;
  discussionPrompts: string[];
  summary: string;
  reportUrl: string;
}): string {
  const mainColor = "#e8607a";
  const darkText = "#1a3560";
  const lightBg = "#fce8ec";
  const skyBg = "#eaf3ff";

  const categoryRows = data.categoryScores.map(cs => {
    const pct = Math.round(cs.score);
    const color = scoreColor(cs.score);
    const align = cs.alignment === "high" ? "Strong" : cs.alignment === "medium" ? "Good" : "Growing";
    return `
      <tr>
        <td style="padding:8px 0;font-family:Georgia,serif;font-size:13px;color:${darkText};width:130px">${categoryLabel(cs.category)}</td>
        <td style="padding:8px 0 8px 12px">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="background:#f0f4f8;border-radius:999px;height:8px;overflow:hidden">
                <table width="${pct}%" cellpadding="0" cellspacing="0" border="0">
                  <tr><td style="background:${color};height:8px;border-radius:999px">&nbsp;</td></tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
        <td style="padding:8px 0 8px 10px;font-family:Arial,sans-serif;font-size:11px;color:${color};font-weight:600;white-space:nowrap;width:70px">${pct}% · ${align}</td>
      </tr>`;
  }).join("");

  const alignedRows = data.alignedAreas.slice(0, 4).map(a => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid rgba(232,96,122,0.12)">
        <p style="margin:0 0 4px;font-family:Georgia,serif;font-style:italic;font-size:13px;color:${darkText}">${a.questionText}</p>
        <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#e8607a">
          ${data.partner1Name}: <strong>${a.partner1Answer}</strong> &nbsp;·&nbsp; ${data.partner2Name}: <strong>${a.partner2Answer}</strong>
        </p>
      </td>
    </tr>`).join("");

  const differingRows = data.differingAreas.slice(0, 3).map(a => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid rgba(184,212,240,0.3)">
        <p style="margin:0 0 4px;font-family:Georgia,serif;font-style:italic;font-size:13px;color:${darkText}">${a.questionText}</p>
        <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#6a90c0">
          ${data.partner1Name}: <strong>${a.partner1Answer}</strong> &nbsp;·&nbsp; ${data.partner2Name}: <strong>${a.partner2Answer}</strong>
        </p>
      </td>
    </tr>`).join("");

  const promptRows = data.discussionPrompts.slice(0, 4).map((p, i) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid rgba(26,53,96,0.07)">
        <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
          <td style="width:24px;vertical-align:top;padding-top:2px">
            <span style="display:inline-block;width:20px;height:20px;background:${mainColor};border-radius:50%;text-align:center;line-height:20px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;color:white">${i + 1}</span>
          </td>
          <td style="padding-left:10px;font-family:Georgia,serif;font-style:italic;font-size:13px;color:${darkText};line-height:1.7">${p}</td>
        </tr></table>
      </td>
    </tr>`).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Compatibility Report</title></head>
<body style="margin:0;padding:0;background:#f8f4f0;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8f4f0;padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,${skyBg} 0%,${lightBg} 100%);border-radius:20px 20px 0 0;padding:40px 40px 32px;text-align:center;border:1px solid rgba(232,96,122,0.15);border-bottom:none">
          <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:${mainColor};font-weight:700">Couple Compass</p>
          <h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:32px;font-weight:400;color:${darkText};line-height:1.1">Compatibility Report</h1>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:rgba(26,53,96,0.5)">${data.partner1Name} &amp; ${data.partner2Name}</p>
        </td></tr>

        <!-- Score -->
        <tr><td style="background:white;padding:36px 40px;text-align:center;border-left:1px solid rgba(232,96,122,0.15);border-right:1px solid rgba(232,96,122,0.15)">
          <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:52px;font-weight:700;color:${scoreColor(data.overallScore)};line-height:1">${data.overallScore}<span style="font-size:20px">%</span></p>
          <p style="margin:0 0 20px;font-family:Georgia,serif;font-style:italic;font-size:16px;color:${scoreColor(data.overallScore)}">${scoreLabel(data.overallScore)}</p>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:rgba(26,53,96,0.6);line-height:1.8;max-width:440px;margin-left:auto;margin-right:auto">${data.summary}</p>
        </td></tr>

        <!-- Category Scores -->
        <tr><td style="background:white;padding:0 40px 28px;border-left:1px solid rgba(232,96,122,0.15);border-right:1px solid rgba(232,96,122,0.15)">
          <p style="margin:0 0 14px;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:${mainColor};font-weight:700">By Category</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">${categoryRows}</table>
        </td></tr>

        <!-- Strengths -->
        <tr><td style="background:${lightBg};padding:28px 40px;border-left:1px solid rgba(232,96,122,0.15);border-right:1px solid rgba(232,96,122,0.15)">
          <p style="margin:0 0 14px;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:${mainColor};font-weight:700">&#x2665; Strengths</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">${alignedRows}</table>
        </td></tr>

        <!-- Growth Areas -->
        ${data.differingAreas.length > 0 ? `
        <tr><td style="background:${skyBg};padding:28px 40px;border-left:1px solid rgba(232,96,122,0.15);border-right:1px solid rgba(232,96,122,0.15)">
          <p style="margin:0 0 14px;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#4a80b8;font-weight:700">&#9672; Growth Areas</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">${differingRows}</table>
        </td></tr>` : ""}

        <!-- Discussion Prompts -->
        <tr><td style="background:white;padding:28px 40px;border-left:1px solid rgba(232,96,122,0.15);border-right:1px solid rgba(232,96,122,0.15)">
          <p style="margin:0 0 14px;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:${mainColor};font-weight:700">Conversation Starters</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">${promptRows}</table>
        </td></tr>

        <!-- Closing Quote -->
        <tr><td style="background:linear-gradient(135deg,${lightBg} 0%,${skyBg} 100%);padding:28px 40px;text-align:center;border-left:1px solid rgba(232,96,122,0.15);border-right:1px solid rgba(232,96,122,0.15)">
          <p style="margin:0 0 24px;font-family:Georgia,serif;font-style:italic;font-size:14px;color:rgba(26,53,96,0.6);line-height:1.7">Understanding each other is the beginning of every great love story.</p>
          <a href="${data.reportUrl}" style="display:inline-block;background:${mainColor};color:white;text-decoration:none;border-radius:10px;padding:13px 28px;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase">View Full Report</a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#1a3560;border-radius:0 0 20px 20px;padding:20px 40px;text-align:center">
          <p style="margin:0;font-family:Georgia,serif;font-style:italic;font-size:13px;color:rgba(255,255,255,0.35)">Couple Compass &mdash; Navigate love together</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

emailReportRouter.post("/sessions/:sessionCode/email-report", async (req, res) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "Email service not configured" });
    return;
  }

  const { sessionCode } = req.params;
  const { emails } = req.body as { emails?: unknown };

  if (!Array.isArray(emails) || emails.length === 0 || !emails.every(e => typeof e === "string" && e.includes("@"))) {
    res.status(400).json({ error: "At least one valid email address is required" });
    return;
  }

  try {
    const [session] = await db.select().from(sessionsTable).where(eq(sessionsTable.sessionCode, sessionCode));
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    if (!session.partner1CompletedAt || !session.partner2CompletedAt) {
      res.status(400).json({ error: "Report is not ready yet — both partners must complete the questionnaire" });
      return;
    }

    const [p1Set, p2Set] = await Promise.all([
      db.select().from(responseSetsTable).where(eq(responseSetsTable.sessionId, session.id)),
      db.select().from(questionsTable),
    ]);

    const responseSets = p1Set;
    const questions = p2Set;

    const allAnswers = await Promise.all(
      responseSets.map(rs => db.select().from(answersTable).where(eq(answersTable.responseSetId, rs.id)))
    );

    const p1Slot = responseSets.find(r => r.partnerSlot === "partner1");
    const p2Slot = responseSets.find(r => r.partnerSlot === "partner2");
    const p1Answers = p1Slot ? allAnswers[responseSets.indexOf(p1Slot)] ?? [] : [];
    const p2Answers = p2Slot ? allAnswers[responseSets.indexOf(p2Slot)] ?? [] : [];

    const p1Map = new Map(p1Answers.map(a => [a.questionId, a.value]));
    const p2Map = new Map(p2Answers.map(a => [a.questionId, a.value]));

    const cats = ["values", "life_plans", "finances", "family", "lifestyle", "communication", "intimacy", "growth"];
    const categoryScores = cats.map(cat => {
      const qs = questions.filter(q => q.category === cat);
      let total = 0, max = 0;
      for (const q of qs) {
        const v1 = parseFloat(p1Map.get(q.id) ?? "3");
        const v2 = parseFloat(p2Map.get(q.id) ?? "3");
        const diff = Math.abs(v1 - v2);
        const score = q.type === "scale" ? Math.max(0, 1 - diff / 4) * q.weight : (v1 === v2 ? q.weight : 0);
        total += score;
        max += q.weight;
      }
      const pct = max > 0 ? Math.round((total / max) * 100) : 50;
      const alignment = pct >= 75 ? "high" : pct >= 50 ? "medium" : "low";
      return { category: cat, score: pct, alignment };
    });

    const overallScore = Math.round(categoryScores.reduce((s, c) => s + c.score, 0) / categoryScores.length);

    const alignedAreas: Array<{ questionText: string; partner1Answer: string; partner2Answer: string }> = [];
    const differingAreas: Array<{ questionText: string; partner1Answer: string; partner2Answer: string }> = [];

    for (const q of questions) {
      const v1 = p1Map.get(q.id) ?? "";
      const v2 = p2Map.get(q.id) ?? "";
      if (!v1 || !v2) continue;
      const diff = q.type === "scale" ? Math.abs(parseFloat(v1) - parseFloat(v2)) : (v1 === v2 ? 0 : 1);
      const item = { questionText: q.text, partner1Answer: v1, partner2Answer: v2 };
      if (diff <= 1) alignedAreas.push(item);
      else differingAreas.push(item);
    }

    const discussionPrompts = differingAreas.slice(0, 4).map(a =>
      `How do you each feel about: "${a.questionText}"?`
    );

    const summary = `${session.partner1Name} and ${session.partner2Name} show ${overallScore >= 75 ? "beautiful" : overallScore >= 55 ? "strong" : "meaningful"} compatibility with an overall score of ${overallScore}%. Their greatest strengths lie in ${categoryScores.sort((a, b) => b.score - a.score)[0]?.category ?? "shared values"}.`;

    const domains = process.env.REPLIT_DOMAINS?.split(",")[0] ?? "localhost";
    const reportUrl = `https://${domains}/report/${sessionCode}`;

    const html = buildEmailHtml({
      partner1Name: session.partner1Name,
      partner2Name: session.partner2Name ?? "Partner 2",
      overallScore,
      categoryScores,
      alignedAreas,
      differingAreas,
      discussionPrompts,
      summary,
      reportUrl,
    });

    const fromAddress = process.env.FROM_EMAIL ?? "Couple Compass <onboarding@resend.dev>";

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromAddress,
        to: emails as string[],
        subject: `${session.partner1Name} & ${session.partner2Name ?? "Partner 2"} — Your Compatibility Report`,
        html,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      req.log.error({ status: response.status, err }, "Resend API error");
      res.status(500).json({ error: "Failed to send email" });
      return;
    }

    res.json({ sent: true });
  } catch (err) {
    req.log.error({ err }, "Failed to send email report");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default emailReportRouter;
