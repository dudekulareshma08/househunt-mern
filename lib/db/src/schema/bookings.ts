import { pgTable, serial, timestamp, integer, pgEnum, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { propertiesTable } from "./properties";

export const bookingStatusEnum = pgEnum("booking_status", ["pending", "confirmed", "cancelled"]);

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => propertiesTable.id),
  renterId: integer("renter_id").notNull().references(() => usersTable.id),
  startDate: date("start_date", { mode: "string" }).notNull(),
  endDate: date("end_date", { mode: "string" }).notNull(),
  status: bookingStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({ id: true, createdAt: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;
