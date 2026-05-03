import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { sessionsTable } from "./sessions";

export const remindersTable = pgTable("reminders", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => sessionsTable.id),
  sessionCode: text("session_code").notNull(),
  email: text("email").notNull(),
  reminderDueAt: timestamp("reminder_due_at").notNull(),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Reminder = typeof remindersTable.$inferSelect;
