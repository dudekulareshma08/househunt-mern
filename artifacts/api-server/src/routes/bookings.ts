import { Router } from "express";
import { db, bookingsTable, propertiesTable, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { verifyToken, requireRole } from "../lib/auth";
import { CreateBookingBody, UpdateBookingStatusParams, UpdateBookingStatusBody } from "@workspace/api-zod";

const router = Router();

async function formatBooking(b: any) {
  const [prop] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, b.propertyId));
  const [renter] = await db.select().from(usersTable).where(eq(usersTable.id, b.renterId));
  return {
    id: b.id,
    propertyId: b.propertyId,
    renterId: b.renterId,
    startDate: b.startDate,
    endDate: b.endDate,
    status: b.status,
    propertyTitle: prop?.title ?? null,
    propertyLocation: prop?.location ?? null,
    propertyRent: prop ? parseFloat(prop.rent) : null,
    renterName: renter?.name ?? null,
    renterEmail: renter?.email ?? null,
    createdAt: b.createdAt,
  };
}

async function formatBookings(bookings: any[]) {
  if (bookings.length === 0) return [];

  const propIds = [...new Set(bookings.map((b) => b.propertyId))];
  const renterIds = [...new Set(bookings.map((b) => b.renterId))];

  const props = await db
    .select()
    .from(propertiesTable)
    .where(sql`${propertiesTable.id} = ANY(${sql.raw("ARRAY[" + propIds.join(",") + "]::int[]")})`);
  const renters = await db
    .select()
    .from(usersTable)
    .where(sql`${usersTable.id} = ANY(${sql.raw("ARRAY[" + renterIds.join(",") + "]::int[]")})`);

  const propMap = new Map(props.map((p) => [p.id, p]));
  const renterMap = new Map(renters.map((u) => [u.id, u]));

  return bookings.map((b) => {
    const prop = propMap.get(b.propertyId);
    const renter = renterMap.get(b.renterId);
    return {
      id: b.id,
      propertyId: b.propertyId,
      renterId: b.renterId,
      startDate: b.startDate,
      endDate: b.endDate,
      status: b.status,
      propertyTitle: prop?.title ?? null,
      propertyLocation: prop?.location ?? null,
      propertyRent: prop ? parseFloat(prop.rent) : null,
      renterName: renter?.name ?? null,
      renterEmail: renter?.email ?? null,
      createdAt: b.createdAt,
    };
  });
}

// POST /bookings — renter only
router.post("/bookings", verifyToken, requireRole("renter"), async (req, res): Promise<void> => {
  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { propertyId, startDate, endDate } = parsed.data;

  const [prop] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, propertyId));
  if (!prop) {
    res.status(404).json({ error: "Property not found" });
    return;
  }
  if (prop.status === "booked") {
    res.status(400).json({ error: "Property is already booked" });
    return;
  }

  if (new Date(startDate) >= new Date(endDate)) {
    res.status(400).json({ error: "Start date must be before end date" });
    return;
  }

  const [booking] = await db
    .insert(bookingsTable)
    .values({
      propertyId,
      renterId: req.user!.userId,
      startDate,
      endDate,
      status: "pending",
    })
    .returning();

  res.status(201).json(await formatBooking(booking));
});

// GET /bookings/my — renter's bookings
router.get("/bookings/my", verifyToken, requireRole("renter"), async (req, res): Promise<void> => {
  const bookings = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.renterId, req.user!.userId))
    .orderBy(bookingsTable.createdAt);

  res.json(await formatBookings(bookings));
});

// GET /bookings/owner — bookings for owner's properties
router.get("/bookings/owner", verifyToken, async (req, res): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const ownerId = req.user.userId;
  const myProps = await db.select().from(propertiesTable).where(eq(propertiesTable.ownerId, ownerId));
  const propIds = myProps.map((p) => p.id);

  if (propIds.length === 0) {
    res.json([]);
    return;
  }

  const bookings = await db
    .select()
    .from(bookingsTable)
    .where(sql`${bookingsTable.propertyId} = ANY(${sql.raw("ARRAY[" + propIds.join(",") + "]::int[]")})`)
    .orderBy(bookingsTable.createdAt);

  res.json(await formatBookings(bookings));
});

// PATCH /bookings/:id/status
router.patch("/bookings/:id/status", verifyToken, async (req, res): Promise<void> => {
  const params = UpdateBookingStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateBookingStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, params.data.id));
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  if (req.user!.role !== "admin") {
    const [prop] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, booking.propertyId));
    if (!prop || prop.ownerId !== req.user!.userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
  }

  const [updated] = await db
    .update(bookingsTable)
    .set({ status: parsed.data.status as any })
    .where(eq(bookingsTable.id, params.data.id))
    .returning();

  res.json(await formatBooking(updated));
});

export default router;
