import { Router } from "express";
import { db, sessionsTable, remindersTable, ratingsTable } from "@workspace/db";
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
    const [sessions, reminders, ratings] = await Promise.all([
      db.select().from(sessionsTable).orderBy(desc(sessionsTable.createdAt)),
      db.select().from(remindersTable).orderBy(desc(remindersTable.createdAt)),
      db.select().from(ratingsTable),
    ]);

    const total = sessions.length;
    const bothCompleted = sessions.filter(s => s.partner1CompletedAt && s.partner2CompletedAt).length;
    const oneCompleted = sessions.filter(s => (s.partner1CompletedAt || s.partner2CompletedAt) && !(s.partner1CompletedAt && s.partner2CompletedAt)).length;
    const noneCompleted = sessions.filter(s => !s.partner1CompletedAt && !s.partner2CompletedAt).length;
    const remindersSent = reminders.filter(r => r.sentAt).length;
    const remindersPending = reminders.filter(r => !r.sentAt).length;
    const avgRating = ratings.length > 0 ? Math.round((ratings.reduce((s, r) => s + r.stars, 0) / ratings.length) * 10) / 10 : null;

    res.json({
      summary: { total, bothCompleted, oneCompleted, noneCompleted, remindersSent, remindersPending, totalRatings: ratings.length, avgRating },
      sessions: sessions.map(s => {
        const rating = ratings.find(r => r.sessionCode === s.sessionCode);
        return {
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
          rating: rating ? { stars: rating.stars, note: rating.note ?? null } : null,
        };
      }),
    });
  } catch (err) {
    req.log.error({ err }, "Admin stats failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default adminRouter;
