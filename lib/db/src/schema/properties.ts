import { pgTable, text, serial, timestamp, numeric, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const propertyTypeEnum = pgEnum("property_type", ["apartment", "house", "villa", "studio", "commercial"]);
export const propertyStatusEnum = pgEnum("property_status", ["available", "booked"]);

export const propertiesTable = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  rent: numeric("rent", { precision: 10, scale: 2 }).notNull(),
  type: propertyTypeEnum("type").notNull().default("apartment"),
  amenities: text("amenities").array().notNull().default([]),
  images: text("images").array().notNull().default([]),
  ownerId: serial("owner_id").references(() => usersTable.id),
  status: propertyStatusEnum("status").notNull().default("available"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPropertySchema = createInsertSchema(propertiesTable).omit({ id: true, createdAt: true });
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof propertiesTable.$inferSelect;
