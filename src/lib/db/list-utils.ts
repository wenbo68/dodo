import { asc, eq, sql } from "drizzle-orm";
import { db } from "../../server/db";
import { items, lists } from "../../server/db/schema";


export async function getNextPosition(userId: string) {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(lists)
    .where(eq(lists.userId, userId));
    
  return result[0]?.count ?? 0;
}

export async function getListsWithItems(userId: string) {
  return await db.query.lists.findMany({
    where: eq(lists.userId, userId),
    with: {
      items: {
        orderBy: [asc(items.position)]
      }
    },
    orderBy: [asc(lists.position)]
  });
}
