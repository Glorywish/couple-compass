import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sessionsTable = pgTable("sessions", {
  id: serial("id").primaryKey(),
  sessionCode: text("session_code").notNull().unique(),
  partner1Name: text("partner1_name").notNull(),
  partner2Name: text("partner2_name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  partner1CompletedAt: timestamp("partner1_completed_at"),
  partner2CompletedAt: timestamp("partner2_completed_at"),
});

export const insertSessionSchema = createInsertSchema(sessionsTable).omit({ id: true, createdAt: true });
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessionsTable.$inferSelect;
