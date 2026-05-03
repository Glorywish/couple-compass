import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { sessionsTable } from "./sessions";

export const ratingsTable = pgTable("ratings", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => sessionsTable.id),
  sessionCode: text("session_code").notNull(),
  stars: integer("stars").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Rating = typeof ratingsTable.$inferSelect;
