import { Router } from "express";
import { db, usersTable, propertiesTable, bookingsTable } from "@workspace/db";
import { eq, count, sql } from "drizzle-orm";
import { verifyToken, requireRole } from "../lib/auth";
import { AdminApproveOwnerParams, AdminApproveOwnerBody } from "@workspace/api-zod";

const router = Router();

const adminOnly = [verifyToken, requireRole("admin")];

// GET /admin/users
router.get("/admin/users", ...adminOnly, async (_req, res): Promise<void> => {
  const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);
  res.json(
    users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      isApproved: u.isApproved,
      createdAt: u.createdAt,
    }))
  );
});

// PATCH /admin/users/:id/approve
router.patch("/admin/users/:id/approve", ...adminOnly, async (req, res): Promise<void> => {
  const params = AdminApproveOwnerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = AdminApproveOwnerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, params.data.id));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const [updated] = await db
    .update(usersTable)
    .set({ isApproved: parsed.data.isApproved })
    .where(eq(usersTable.id, params.data.id))
    .returning();

  res.json({
    id: updated.id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    isApproved: updated.isApproved,
    createdAt: updated.createdAt,
  });
});

// GET /admin/properties
router.get("/admin/properties", ...adminOnly, async (_req, res): Promise<void> => {
  const rows = await db
    .select({ p: propertiesTable, ownerName: usersTable.name })
    .from(propertiesTable)
    .leftJoin(usersTable, eq(propertiesTable.ownerId, usersTable.id))
    .orderBy(propertiesTable.createdAt);

  res.json(
    rows.map((r) => ({
      id: r.p.id,
      title: r.p.title,
      description: r.p.description,
      location: r.p.location,
      rent: parseFloat(r.p.rent),
      type: r.p.type,
      amenities: r.p.amenities ?? [],
      images: r.p.images ?? [],
      ownerId: r.p.ownerId,
      ownerName: r.ownerName ?? null,
      status: r.p.status,
      createdAt: r.p.createdAt,
    }))
  );
});

// GET /admin/bookings
router.get("/admin/bookings", ...adminOnly, async (_req, res): Promise<void> => {
  const bookings = await db.select().from(bookingsTable).orderBy(bookingsTable.createdAt);

  if (bookings.length === 0) {
    res.json([]);
    return;
  }

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

  res.json(
    bookings.map((b) => {
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
    })
  );
});

// GET /admin/stats
router.get("/admin/stats", ...adminOnly, async (_req, res): Promise<void> => {
  const users = await db.select().from(usersTable);
  const properties = await db.select().from(propertiesTable);
  const bookings = await db.select().from(bookingsTable);

  res.json({
    totalUsers: users.length,
    totalOwners: users.filter((u) => u.role === "owner").length,
    totalRenters: users.filter((u) => u.role === "renter").length,
    totalProperties: properties.length,
    totalBookings: bookings.length,
    pendingBookings: bookings.filter((b) => b.status === "pending").length,
    availableProperties: properties.filter((p) => p.status === "available").length,
    bookedProperties: properties.filter((p) => p.status === "booked").length,
  });
});

export default router;
