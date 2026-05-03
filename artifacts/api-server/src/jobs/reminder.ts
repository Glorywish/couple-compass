import cron from "node-cron";
import { db, remindersTable, sessionsTable } from "@workspace/db";
import { and, eq, isNull, lte } from "drizzle-orm";
import { logger } from "../lib/logger";

function buildReminderHtml(data: {
  partner1Name: string;
  partner2Name: string;
  reportUrl: string;
}): string {
  const { partner1Name, partner2Name, reportUrl } = data;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Revisit Your Compatibility Report</title>
</head>
<body style="margin:0;padding:0;background:#f5f0eb;font-family:Inter,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0eb;padding:40px 16px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 32px rgba(232,96,122,0.10);max-width:100%;">
      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,#e8607a 0%,#c94468 100%);padding:36px 40px 28px;text-align:center;">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.75);font-weight:600;">Couple Compass</p>
          <h1 style="margin:0;font-size:26px;font-weight:700;color:white;line-height:1.25;">30 days have passed</h1>
          <p style="margin:8px 0 0;font-size:15px;color:rgba(255,255,255,0.85);">How are ${partner1Name} &amp; ${partner2Name} doing?</p>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:36px 40px;">
          <p style="margin:0 0 20px;font-size:15px;color:#3d2a2a;line-height:1.75;">
            Hey there! It's been a month since ${partner1Name} and ${partner2Name} explored their compatibility together.
            A lot can change, grow, and deepen in 30 days — it might be a great time to revisit your report and
            reflect on how your conversations have evolved.
          </p>
          <p style="margin:0 0 28px;font-size:15px;color:#3d2a2a;line-height:1.75;">
            Your full compatibility report is still waiting — scores, insights, and the topics worth talking about again.
          </p>

          <!-- CTA -->
          <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
            <tr>
              <td style="background:#e8607a;border-radius:12px;box-shadow:0 4px 18px rgba(232,96,122,0.35);">
                <a href="${reportUrl}" style="display:block;padding:14px 36px;font-size:14px;font-weight:700;color:white;text-decoration:none;letter-spacing:0.08em;text-transform:uppercase;">
                  View Your Report
                </a>
              </td>
            </tr>
          </table>

          <p style="margin:0;font-size:13px;color:rgba(61,42,42,0.5);line-height:1.6;">
            If you'd rather not receive reminders, simply ignore this email — we won't send another one.
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#fce8ec;padding:20px 40px;text-align:center;">
          <p style="margin:0;font-size:11px;color:rgba(232,96,122,0.7);letter-spacing:0.1em;text-transform:uppercase;">Couple Compass &mdash; For couples who want to go deeper</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

async function sendDueReminders(): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    logger.warn("RESEND_API_KEY not set — skipping reminder job");
    return;
  }

  const now = new Date();

  const due = await db
    .select({ reminder: remindersTable, session: sessionsTable })
    .from(remindersTable)
    .innerJoin(sessionsTable, eq(remindersTable.sessionId, sessionsTable.id))
    .where(and(isNull(remindersTable.sentAt), lte(remindersTable.reminderDueAt, now)));

  if (due.length === 0) {
    logger.info("Reminder job: no due reminders");
    return;
  }

  logger.info({ count: due.length }, "Reminder job: sending due reminders");

  const fromAddress = process.env.FROM_EMAIL ?? "Couple Compass <onboarding@resend.dev>";
  const domains = process.env.REPLIT_DOMAINS?.split(",")[0] ?? "localhost";

  for (const { reminder, session } of due) {
    const reportUrl = `https://${domains}/report/${reminder.sessionCode}`;
    const html = buildReminderHtml({
      partner1Name: session.partner1Name,
      partner2Name: session.partner2Name ?? "your partner",
      reportUrl,
    });

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [reminder.email],
          subject: `${session.partner1Name} & ${session.partner2Name ?? "your partner"} — Revisit Your Compatibility Report`,
          html,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        logger.error({ reminderId: reminder.id, status: response.status, err }, "Reminder email failed");
        continue;
      }

      await db
        .update(remindersTable)
        .set({ sentAt: new Date() })
        .where(eq(remindersTable.id, reminder.id));

      logger.info({ reminderId: reminder.id, email: reminder.email }, "Reminder sent");
    } catch (err) {
      logger.error({ reminderId: reminder.id, err }, "Error sending reminder");
    }
  }
}

export function startReminderJob(): void {
  cron.schedule("0 9 * * *", () => {
    sendDueReminders().catch(err => logger.error({ err }, "Reminder job crashed"));
  }, { timezone: "UTC" });

  logger.info("Reminder cron job scheduled (daily 09:00 UTC)");
}
