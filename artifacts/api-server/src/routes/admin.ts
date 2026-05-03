import { Router } from "express";
import { db, sessionsTable, remindersTable } from "@workspace/db";
import { desc, eq, isNotNull, isNull } from "drizzle-orm";

const adminRouter = Router();

const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "couple-compass-admin";

function requireAdmin(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) {
  const token = req.headers["x-admin-secret"] ?? req.query["secret"];
  if (token !== ADMIN_SECRET) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

adminRouter.get("/admin/stats", requireAdmin, async (req, res) => {
  try {
    const sessions = await db.select().from(sessionsTable).orderBy(desc(sessionsTable.createdAt));
    const reminders = await db.select().from(remindersTable).orderBy(desc(remindersTable.createdAt));

    const total = sessions.length;
    const bothCompleted = sessions.filter(s => s.partner1CompletedAt && s.partner2CompletedAt).length;
    const oneCompleted = sessions.filter(s => (s.partner1CompletedAt || s.partner2CompletedAt) && !(s.partner1CompletedAt && s.partner2CompletedAt)).length;
    const noneCompleted = sessions.filter(s => !s.partner1CompletedAt && !s.partner2CompletedAt).length;
    const remindersSent = reminders.filter(r => r.sentAt).length;
    const remindersPending = reminders.filter(r => !r.sentAt).length;

    res.json({
      summary: { total, bothCompleted, oneCompleted, noneCompleted, remindersSent, remindersPending },
      sessions: sessions.map(s => ({
        id: s.id,
        sessionCode: s.sessionCode,
        partner1Name: s.partner1Name,
        partner2Name: s.partner2Name ?? null,
        createdAt: s.createdAt.toISOString(),
        partner1CompletedAt: s.partner1CompletedAt?.toISOString() ?? null,
        partner2CompletedAt: s.partner2CompletedAt?.toISOString() ?? null,
        status: s.partner1CompletedAt && s.partner2CompletedAt ? "complete"
          : s.partner1CompletedAt || s.partner2CompletedAt ? "partial"
          : "pending",
        reminders: reminders.filter(r => r.sessionCode === s.sessionCode).map(r => ({
          email: r.email,
          reminderDueAt: r.reminderDueAt.toISOString(),
          sentAt: r.sentAt?.toISOString() ?? null,
        })),
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Admin stats failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default adminRouter;
