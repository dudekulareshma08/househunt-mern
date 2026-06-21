import { db, usersTable, propertiesTable } from "@workspace/db";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  const accounts = [
    { name: "Admin User", email: "admin@househunt.com", password: "admin123", role: "admin" as const, isApproved: true },
    { name: "Property Owner", email: "owner@househunt.com", password: "owner123", role: "owner" as const, isApproved: true },
    { name: "Jane Renter", email: "renter@househunt.com", password: "renter123", role: "renter" as const, isApproved: true },
  ];

  const userIds: Record<string, number> = {};
  for (const acc of accounts) {
    const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, acc.email));
    if (existing) {
      userIds[acc.email] = existing.id;
      console.log(`  User ${acc.email} already exists (id=${existing.id})`);
    } else {
      const hashed = await bcrypt.hash(acc.password, 10);
      const [u] = await db.insert(usersTable).values({ ...acc, password: hashed }).returning();
      userIds[acc.email] = u.id;
      console.log(`  Created user ${acc.email} (id=${u.id})`);
    }
  }

  const ownerId = userIds["owner@househunt.com"];

  const properties = [
    {
      title: "Modern Downtown Apartment",
      description: "A bright, spacious 2-bedroom apartment in the heart of downtown. Floor-to-ceiling windows with city views, modern kitchen, and in-unit laundry.",
      location: "New York, NY",
      rent: "3200",
      type: "apartment" as const,
      amenities: ["WiFi", "Gym", "Doorman", "Laundry", "AC"],
      images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80"],
      ownerId,
      status: "available" as const,
    },
    {
      title: "Cozy Studio in Midtown",
      description: "Perfect for young professionals. Fully furnished studio with modern decor, walking distance to subway and restaurants.",
      location: "New York, NY",
      rent: "1800",
      type: "studio" as const,
      amenities: ["WiFi", "AC", "Furnished"],
      images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"],
      ownerId,
      status: "available" as const,
    },
    {
      title: "Spacious Family Home",
      description: "Beautiful 4-bedroom family home with large backyard, modern kitchen, and 2-car garage. Great school district.",
      location: "Austin, TX",
      rent: "2800",
      type: "house" as const,
      amenities: ["Parking", "Backyard", "AC", "Washer/Dryer", "Pet Friendly"],
      images: ["https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80"],
      ownerId,
      status: "available" as const,
    },
    {
      title: "Luxury Beachfront Villa",
      description: "Stunning 5-bedroom villa with direct beach access, private pool, chef's kitchen, and breathtaking ocean views.",
      location: "Miami Beach, FL",
      rent: "8500",
      type: "villa" as const,
      amenities: ["Pool", "Beach Access", "WiFi", "AC", "Parking", "Security"],
      images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80"],
      ownerId,
      status: "available" as const,
    },
    {
      title: "Downtown Loft with Views",
      description: "Industrial-style loft in a converted warehouse. High ceilings, exposed brick, modern finishes, rooftop access.",
      location: "Chicago, IL",
      rent: "2400",
      type: "apartment" as const,
      amenities: ["WiFi", "Rooftop", "Parking", "AC", "Gym"],
      images: ["https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80"],
      ownerId,
      status: "available" as const,
    },
    {
      title: "Suburban Townhouse",
      description: "3-bedroom townhouse in a quiet neighborhood. Updated kitchen, private patio, community pool and tennis courts.",
      location: "San Jose, CA",
      rent: "3600",
      type: "house" as const,
      amenities: ["Pool", "Parking", "AC", "Patio", "Gym"],
      images: ["https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=800&q=80"],
      ownerId,
      status: "available" as const,
    },
  ];

  for (const prop of properties) {
    const [existing] = await db
      .select()
      .from(propertiesTable)
      .where(eq(propertiesTable.title, prop.title));
    if (existing) {
      console.log(`  Property "${prop.title}" already exists`);
    } else {
      await db.insert(propertiesTable).values(prop);
      console.log(`  Created property: ${prop.title}`);
    }
  }

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
