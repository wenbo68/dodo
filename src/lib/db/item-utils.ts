"use server";

import { db } from "@/server/db";
import { items } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function getItem(itemId: string) {
  return await db.query.items.findFirst({
    where: eq(items.id, itemId),
  });
}
