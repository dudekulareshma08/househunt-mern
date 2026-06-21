import { Router } from "express";
import { db, propertiesTable, usersTable } from "@workspace/db";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { verifyToken, requireApprovedOwner } from "../lib/auth";
import {
  ListPropertiesQueryParams,
  CreatePropertyBody,
  UpdatePropertyBody,
  GetPropertyParams,
  UpdatePropertyParams,
  DeletePropertyParams,
} from "@workspace/api-zod";

const router = Router();

function formatProperty(p: any, ownerName?: string | null) {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    location: p.location,
    rent: parseFloat(p.rent),
    type: p.type,
    amenities: p.amenities ?? [],
    images: p.images ?? [],
    ownerId: p.ownerId,
    ownerName: ownerName ?? p.ownerName ?? null,
    status: p.status,
    createdAt: p.createdAt,
  };
}

// GET /properties — public with filters
router.get("/properties", async (req, res): Promise<void> => {
  const parsed = ListPropertiesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { location, minRent, maxRent, type, status } = parsed.data;

  const conditions = [];
  if (location) {
    conditions.push(sql`lower(${propertiesTable.location}) like ${"%" + location.toLowerCase() + "%"}`);
  }
  if (minRent !== undefined) {
    conditions.push(gte(propertiesTable.rent, String(minRent)));
  }
  if (maxRent !== undefined) {
    conditions.push(lte(propertiesTable.rent, String(maxRent)));
  }
  if (type) {
    conditions.push(eq(propertiesTable.type, type as any));
  }
  if (status) {
    conditions.push(eq(propertiesTable.status, status as any));
  }

  const rows = await db
    .select({
      p: propertiesTable,
      ownerName: usersTable.name,
    })
    .from(propertiesTable)
    .leftJoin(usersTable, eq(propertiesTable.ownerId, usersTable.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(propertiesTable.createdAt);

  res.json(rows.map((r) => formatProperty(r.p, r.ownerName)));
});

// GET /properties/owner/mine — owner's own properties
router.get("/properties/owner/mine", verifyToken, requireApprovedOwner, async (req, res): Promise<void> => {
  const ownerId = req.user!.role === "admin" ? undefined : req.user!.userId;
  const rows = await db
    .select({ p: propertiesTable, ownerName: usersTable.name })
    .from(propertiesTable)
    .leftJoin(usersTable, eq(propertiesTable.ownerId, usersTable.id))
    .where(ownerId !== undefined ? eq(propertiesTable.ownerId, ownerId) : undefined)
    .orderBy(propertiesTable.createdAt);

  res.json(rows.map((r) => formatProperty(r.p, r.ownerName)));
});

// GET /stats/owner
router.get("/stats/owner", verifyToken, requireApprovedOwner, async (req, res): Promise<void> => {
  const ownerId = req.user!.userId;
  const { bookingsTable } = await import("@workspace/db");

  const allProps = await db.select().from(propertiesTable).where(eq(propertiesTable.ownerId, ownerId));
  const propIds = allProps.map((p) => p.id);

  let totalBookings = 0;
  let pendingBookings = 0;
  let confirmedBookings = 0;

  if (propIds.length > 0) {
    const bookings = await db
      .select()
      .from(bookingsTable)
      .where(sql`${bookingsTable.propertyId} = ANY(${sql.raw("ARRAY[" + propIds.join(",") + "]::int[]")})`);
    totalBookings = bookings.length;
    pendingBookings = bookings.filter((b) => b.status === "pending").length;
    confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
  }

  res.json({
    totalProperties: allProps.length,
    availableProperties: allProps.filter((p) => p.status === "available").length,
    bookedProperties: allProps.filter((p) => p.status === "booked").length,
    totalBookings,
    pendingBookings,
    confirmedBookings,
  });
});

// GET /properties/:id — single property
router.get("/properties/:id", async (req, res): Promise<void> => {
  const params = GetPropertyParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select({ p: propertiesTable, ownerName: usersTable.name })
    .from(propertiesTable)
    .leftJoin(usersTable, eq(propertiesTable.ownerId, usersTable.id))
    .where(eq(propertiesTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "Property not found" });
    return;
  }

  res.json(formatProperty(row.p, row.ownerName));
});

// POST /properties — owner only
router.post("/properties", verifyToken, requireApprovedOwner, async (req, res): Promise<void> => {
  const parsed = CreatePropertyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { title, description, location, rent, type, amenities, images } = parsed.data;

  const [property] = await db
    .insert(propertiesTable)
    .values({
      title,
      description,
      location,
      rent: String(rent),
      type: type as any,
      amenities: amenities ?? [],
      images: images ?? [],
      ownerId: req.user!.userId,
      status: "available",
    })
    .returning();

  res.status(201).json(formatProperty(property));
});

// PUT /properties/:id — owner only
router.put("/properties/:id", verifyToken, requireApprovedOwner, async (req, res): Promise<void> => {
  const params = UpdatePropertyParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdatePropertyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Property not found" });
    return;
  }

  if (req.user!.role !== "admin" && existing.ownerId !== req.user!.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const updates: any = {};
  const d = parsed.data;
  if (d.title !== undefined) updates.title = d.title;
  if (d.description !== undefined) updates.description = d.description;
  if (d.location !== undefined) updates.location = d.location;
  if (d.rent !== undefined) updates.rent = String(d.rent);
  if (d.type !== undefined) updates.type = d.type;
  if (d.amenities !== undefined) updates.amenities = d.amenities;
  if (d.images !== undefined) updates.images = d.images;
  if (d.status !== undefined) updates.status = d.status;

  const [updated] = await db
    .update(propertiesTable)
    .set(updates)
    .where(eq(propertiesTable.id, params.data.id))
    .returning();

  res.json(formatProperty(updated));
});

// DELETE /properties/:id — owner only
router.delete("/properties/:id", verifyToken, requireApprovedOwner, async (req, res): Promise<void> => {
  const params = DeletePropertyParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existing] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Property not found" });
    return;
  }

  if (req.user!.role !== "admin" && existing.ownerId !== req.user!.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  await db.delete(propertiesTable).where(eq(propertiesTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
