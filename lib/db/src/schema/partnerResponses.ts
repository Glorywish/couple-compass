import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { sessionsTable } from "./sessions";

export const partnerResponsesTable = pgTable("partner_responses", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => sessionsTable.id),
  partnerSlot: text("partner_slot").notNull(),
  partnerName: text("partner_name").notNull(),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

export const answersTable = pgTable("answers", {
  id: serial("id").primaryKey(),
  responseId: integer("response_id").notNull().references(() => partnerResponsesTable.id),
  questionId: integer("question_id").notNull(),
  value: text("value").notNull(),
});

export const insertPartnerResponseSchema = createInsertSchema(partnerResponsesTable).omit({ id: true, submittedAt: true });
export type InsertPartnerResponse = z.infer<typeof insertPartnerResponseSchema>;
export type PartnerResponse = typeof partnerResponsesTable.$inferSelect;

export const insertAnswerSchema = createInsertSchema(answersTable).omit({ id: true });
export type InsertAnswer = z.infer<typeof insertAnswerSchema>;
export type Answer = typeof answersTable.$inferSelect;
